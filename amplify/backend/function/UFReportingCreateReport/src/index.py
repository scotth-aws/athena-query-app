import boto3, botocore, os
import pandas as pd
import sys
import logging
import json
import datetime

from pyathena import connect
from pyathena.pandas.util import as_pandas
from pyathena.async_cursor import AsyncCursor, AsyncDictCursor
from pyathena.error import NotSupportedError, ProgrammingError
from pyathena.model import AthenaQueryExecution
from pyathena.result_set import AthenaResultSet

logger = logging.getLogger()
logger.setLevel(logging.INFO)

conn = connect(s3_staging_dir=os.environ['ATHENA_OUTPUT_BUCKET'],region_name='us-east-1') #replace with your own bucket name
#
#
#
def execute_query_async(query):
    query_summary = '''Query execution summary:
        DataScanned(MB): {}
        ExecutionTime(s): {}
        QueuingTime(s): {}'''

    df = None
    acursor = conn.cursor(AsyncCursor)
    query_id, future = acursor.execute(query)
    result_set = future.result()
    if result_set.state == AthenaQueryExecution.STATE_SUCCEEDED:
        output_location = result_set.output_location
        result_summary = query_summary.format(result_set.data_scanned_in_bytes/100000, 
                                   result_set.engine_execution_time_in_millis/1000, 
                                   result_set.query_queue_time_in_millis/1000)
        print(query_summary.format(result_set.data_scanned_in_bytes/100000, 
                                   result_set.engine_execution_time_in_millis/1000, 
                                   result_set.query_queue_time_in_millis/1000))    
        rows = result_set.fetchall()
        cols = [x[0] for x in result_set.description]
        df = pd.DataFrame(rows, columns=cols)
        
    acursor.close()
    print('execute_query_async ',df)
    return df,result_summary,output_location

#
#
#
def execute_query(query):
    query_summary = '''Query execution summary:
        DataScanned(MB): {}
        ExecutionTime(s): {}
        QueuingTime(s): {}'''

    df = None
    cursor = conn.cursor()
    df = cursor.execute(query)
        
    cursor.close()
    return df
#
#
#
def update_ddb(event,result_summary,output_location):
    try:
        print('update_ddb place holder ',event)
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['STORAGE_UFREPORTINGTABLE_NAME'])
        ct = datetime.datetime.now()
        epoch_time = ct.strftime('%s')
        print(epoch_time)
        response = table.put_item(
            Item={
                'id': '1',
                'createdAt': int(epoch_time),
                'outputLocation': output_location,
                'resultSummary': result_summary
            }
        )
       
        # session = requests.Session()
        # 
        #graphqlEndpoint = os.environ['API_EDURESDEPLOYER_GRAPHQLAPIENDPOINTOUTPUT']
        #APPSYNC_API_ENDPOINT_URL = graphqlEndpoint
        #id = event['id']
        #token = event['token']
        #aid = get_account_id()
        #print('update_ddb_on_failure aid ', aid)

        #x = datetime.datetime.now()
        #date_time = x.strftime("%m/%d/%Y, %H:%M:%S")
        # setup the query string (optional)
        #mutation = 'mutation MyMutation{ publishResult(result: {id: "'+id + \
        #    '",outputs: "' + str(eJson) + '", stackName: "' + \
        #    stackName+'", deploymentStatus: '+status+', aid: "' + \
        #    str(aid)+'"}){id deploymentStatus outputs}}'
        #
        #logger.info(
            #{"operation": "update_ddb_on_failure", "mutation": mutation})
        #response = session.request(
            #url=APPSYNC_API_ENDPOINT_URL,
            #method='POST',
            #headers={'Authorization': token},
            #json={'query': mutation}
        #)


        #logger.info(
            #{"operation": "update_ddb_on_failure", "mutation response": response})
        #return response
        #return {"id": event['id'], "status": "CREATE_FAILED"}
        #raise Exception(e)

    except Exception as e:
        logger.error(
            {"operation": "update_ddb_on_failure", "Exception": e})
        raise Exception(e)
        
#
#
#
def handler(event, context):
    """
    :param event: The event dict that contains the parameters sent when the function
                  is invoked.
    :param context: The context in which the function is called.
    :return: The result of the action.
    """
    result = None
    #action = event.get('action')
    s3 = boto3.resource('s3')
    glue = boto3.client('glue')
    query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 1"
    #result = cursor.execute(query)
    #df = as_pandas(cursor)
    df,result_summary,output_location = execute_query_async(query)
    print('df ',df)
    print('summary ',result_summary)
    update_ddb(event,result_summary,output_location)
    response = {'id': '1','result': json.loads(df.to_json(orient = 'records')),'resultSummary': result_summary, 'outputLocation': output_location}
    return response