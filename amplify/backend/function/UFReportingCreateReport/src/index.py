import boto3
import botocore
import os
import pandas as pd
import sys
import logging
import json
import datetime
import uuid

from pyathena import connect
from pyathena.pandas.util import as_pandas
from pyathena.async_cursor import AsyncCursor, AsyncDictCursor
from pyathena.error import NotSupportedError, ProgrammingError
from pyathena.model import AthenaQueryExecution
from pyathena.result_set import AthenaResultSet

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# replace with your own bucket name
conn = connect(
    s3_staging_dir=os.environ['ATHENA_OUTPUT_BUCKET'], region_name='us-east-1')
#
#
#


def execute_query_async(query):
    try:
        query_summary = '''Query execution summary:
            DataScanned(MB): {}
            ExecutionTime(s): {}
            QueuingTime(s): {}'''

        df = None
        result_set = None
        output_location = None
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

            print('execute_query_async ',df)
            acursor.close()
            return df,result_summary,output_location,result_set

        else:
            print('result set error_category',result_set.error_category, 'result set error_type',result_set.error_type,'result set error_message',result_set.error_message )
            acursor.close()
            return df,result_set.state+' - '+result_set.error_message,output_location,result_set
    except Exception as e:
        logger.error(
            {"operation": "execute_query_async", "Exception": e})
        raise Exception(e)

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


def update_ddb(name, description, query,result_summary, output_location,result_set):
    try:
        print('update_ddb place holder ', name)
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['STORAGE_UFREPORTINGTABLE_NAME'])
        ct = datetime.datetime.now()
        epoch_time = ct.strftime('%s')
        print(epoch_time)
        id = str(uuid.uuid4())
        response = table.put_item(
            Item={
                'id': id,
                'name': name,
                'description': description,
                'query': query,
                'createdAt': int(epoch_time),
                'outputLocation': output_location,
                'resultSummary': result_summary,
                'queryState': result_set.state,
                'queryError': result_set.error_message
            }
        )

        return {"id": id, "createdAt": int(epoch_time), "outputLocation": output_location, "resultSummary": result_summary, "query": query, "name": name, "description": description}

       

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
    print('event data ', event['arguments']['input']['query'])
    query = None
    
    try:
      event['arguments']['input']['description']
      description = event['arguments']['input']['description']
    except Exception:
      print('Exception')
      description = ""

    try:
      event['arguments']['input']['name']
      name = event['arguments']['input']['name']
    except Exception:
      print('Exception')
      name = ""

    try:
        s3 = boto3.resource('s3')
        glue = boto3.client('glue')
        # query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 1"
        query = event['arguments']['input']['query']
        df, result_summary, output_location, result_set = execute_query_async(query)
        response = update_ddb(name, description, query, result_summary, output_location, result_set)
        print('response ', response)
        return response
    except Exception as e:
      logger.error(
        {"operation": "handler", "Exception": e})
      raise Exception(e)
     
