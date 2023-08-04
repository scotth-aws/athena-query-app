import React, { useState, useEffect } from "react";
import "./index.css";
import "@aws-amplify/ui-react/styles.css";
import {
  AppLayout,
  Box,
  Header,
  HelpPanel,
  Button,
  SpaceBetween,
  TextFilter,
  TextContent,
  Table,
  Pagination,
  CollectionPreferences,
  Cards,
  ColumnLayout,
  Link,
  Grid,
  Container

} from "@cloudscape-design/components";
//import { appLayoutLabels } from "../labels";
import { withAuthenticator } from "@aws-amplify/ui-react";
import Navigation from "../Navigation";
import {
  Logger,
  Auth,
  API,
  graphqlOperation,
  Storage

} from "aws-amplify";
import { listReports } from "../../graphql/queries";

Storage.configure({
  AWSS3: {
    bucket: 'scotthoutput',
    region: 'us-east-1',
    level: "public",
    customPrefix: {
      public: "",
    },
  },
});

const Content = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [selectedItems, setSelectedItems] = React.useState([{ name: "" }]);
  const [selectedItemsOutputs, setSelectedItemsOutputs] = React.useState([]);
  const [reports, setReports] = React.useState([]);
  const [description, setDescription] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [downloadReport, setDownloadReport] = React.useState("");
  const [downloadSignedUrl, setDownloadSignedUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const [pagesCount, setPagesCount] = React.useState(
    Math.ceil(reports.length / 5)
  );


  useEffect(() => {
    API.graphql(graphqlOperation(listReports, {})).then((response, error) => {

      //console.log('listReports ' + JSON.stringify(response.data.listReports.items));
      var list = response.data.listReports.items;
      list.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1)
      setReports(list);

    })
    /*
    API.graphql({
        query: onCreateHackathonLectureSummary,

    }).subscribe({
        next: (data) => {

            if (process.env.NODE_ENV === 'development')
                console.log(
                    "onCreateHackathonLectureSummary event " +
                    JSON.stringify(data.value.data.onCreateHackathonLectureSummary)
                );

            //alert('Lecture Summaries Updated');
            setAlertVisible(true);


        },
    });
    */
  }, []);



  function convertEpochToSpecificTimezone(timeEpoch, offset) {
    //Convert epoch to human readable date
    var myDate = new Date(timeEpoch * 1000);
    var hr = myDate.toGMTString();
    //console.log(' human readable ' + hr)
    return hr;
  }
  const selectionChangeButton = (detail) => {
    setButtonDisabled(false);
    setSummary('Summary : ');
    setDescription('Description : ')
    setDownloadReport('Get Signed URL : ');
    setQuery('Executed Query: ');
    setSelectedItems(detail.selectedItems);
    if (detail.selectedItems.length !== 0) {
      //setSelectedItemsOutputs([]);
      //setSelectedItems(detail.selectedItems);
      return;
    } else {
      console.log("selectionChangeButton HIT " + JSON.stringify(detail.selectedItems));
      setSelectedItems(detail.selectedItems);


    }

  };

  const getCsvReport = async (event) => {
    
    console.log('Downloading . . .' + JSON.stringify(selectedItems[0]));
    var n = selectedItems[0].outputLocation.lastIndexOf('/');
    var reportObject = selectedItems[0].outputLocation.substring(n + 1);
    try {
      const result = await Storage.get(reportObject, {
        bucket: 'scotthoutput', download: false,
        progressCallback(progress) {
          console.log(`Downloaded: ${progress.loaded}/${progress.total}`);
          //setProgressBarValue((progress.loaded / progress.total) * 100);
        },
      });

      // data.Body is a Blob
      //result.Body.text().then((string) => {
      // handle the String data return String
      //console.log('s3 body ' + string);
      //setSummaryOutput(string);
      //});
      console.log(result);
      setDownloadSignedUrl(result);
      setLinkText('Get Signed URL');
     
    } catch (err) {
      console.log('get error ' + err);
  
    }

  };

  return (
    <div className="container">


      <Table
        onSelectionChange={({ detail }) =>

          selectionChangeButton(detail)
        }
        selectedItems={selectedItems}
        ariaLabels={{
          selectionGroupLabel: "Items selection",
          allItemsSelectionLabel: ({ selectedItems }) =>
            `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "items"
            } selected`,
          itemSelectionLabel: ({ selectedItems }, item) => {
            const isItemSelected = selectedItems.filter(
              i => i.createdAt === item.createdAt
            ).length;
            return `${item.createdAt} is ${isItemSelected ? "" : "not"
              } selected`;
          }
        }}
        columnDefinitions={[
          {
            id: "createdAt",
            header: "Date Created",
            cell: e => convertEpochToSpecificTimezone(e.createdAt),
            sortingField: "createdAt"
          },
          {
            id: "name",
            header: "Report Name",
            cell: e => e.name,
            sortingField: "alt"
          }

        ]}
        items={reports}
        loadingText="Loading resources"
        selectionType="single"
        sortingDescending
        trackBy="id"
        visibleColumns={[
          "createdAt",
          "name",
          "outputLocation"
        ]}
        empty={
          <Box textAlign="center" color="inherit">
            <b></b>
            <Box
              padding={{ bottom: "s" }}
              variant="p"
              color="inherit"
            >
              No resources to display.
            </Box>
            <Button>Create resource</Button>
          </Box>
        }

        header={
          <ColumnLayout columns={2}>
            <Header
              counter={
                selectedItems.length
                  ? "(" + selectedItems.length + "/10)"
                  : "(10)"
              }
            >
              Completed Reports
            </Header>
            <Button disabled={buttonDisabled} onClick={(event) => getCsvReport(event)}>Download</Button>
          </ColumnLayout>
        }
        pagination={
          <Pagination
            //currentPageIndex={1}
            currentPageIndex={currentPageIndex}
            //onChange={({ detail }) => setMatches(detail)}
            pagesCount={pagesCount}
            //pagesCount={2}
            ariaLabels={{
              nextPageLabel: "Next page",
              previousPageLabel: "Previous page",
              pageLabel: pageNumber =>
                `Page 1 of all pages`
            }}
          />
        }
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize: 10,
              visibleContent: [
                "createdAt",
                "name"

              ]
            }}
            pageSizePreference={{
              title: "Page size",
              options: [
                { value: 10, label: "10 resources" },
                { value: 20, label: "20 resources" }
              ]
            }}
            wrapLinesPreference={{
              label: "Wrap lines",
              description:
                "Select to see all the text and wrap the lines"
            }}
            stripedRowsPreference={{
              label: "Striped rows",
              description:
                "Select to add alternating shaded rows"
            }}
            contentDensityPreference={{
              label: "Compact mode",
              description:
                "Select to display content in a denser, more compact mode"
            }}
            visibleContentPreference={{
              title: "Select visible content",
              options: [
                {
                  label: "Main distribution properties",
                  options: [
                    {
                      id: "createdAt",
                      label: "Date Created",
                      editable: false
                    },
                    { id: "name", label: "Name", editable: false },


                  ]
                }
              ]
            }}
          />
        }
      />
      <div className="container">


        <ColumnLayout columns={1}>

          <div><TextContent>{description} {selectedItems[0].description}</TextContent></div>
          <div><TextContent>{summary} {selectedItems[0].resultSummary}</TextContent></div>
          <div><TextContent>{query} {selectedItems[0].query}</TextContent></div>
        
            <div><Link  onFollow={() =>   setLinkText('')      } external href={downloadSignedUrl}>{linkText}</Link></div>

        </ColumnLayout>




      </div>
    </div>
  );
}

const SideHelp = () => (
  <HelpPanel header={<h2>Reporting Home Help</h2>}>
    <SpaceBetween size="m">
      <Box>Something here</Box>
    </SpaceBetween>
  </HelpPanel>
);

function Home() {

  //console.log("User " + JSON.stringify(User));
  const [User, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let current_user = {};
    try {
      current_user = {
        isLoggedIn: false,
        isOperator: true,
        isAdmin: false,
        username: "",
        token: "",
      };
      // get the current authenticated user object
      Auth.currentAuthenticatedUser({
        bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
      })
        .then((user) => {
          setIsLoading(false);

        })
        .catch(
          (err) => {
            setIsLoading(false);
            if (process.env.NODE_ENV === 'development')
              console.log("Home -> index.jsx - Auth error " + JSON.stringify(err), Date.now())

          });


    } catch (e) {
      console.log("setUser Error");
      setUser(current_user);
      setIsLoading(false);

    } finally {
      console.log("finally ");
      setIsLoading(false);
    }
  }, []);
  const [lnavopen, setLnavopen] = useState(false);
  const [rnavopen, setRnavopen] = useState(false);
  const navChange = (detail) => {
    setLnavopen(detail.open);
  };
  const toolsChange = (detail) => {
    setRnavopen(detail.open);
  };
  if (!isLoading) {
    return (
      <AppLayout
        disableContentPaddings={false}
        navigation={<Navigation User={User} />}
        content={<Content User={User} />}
        contentType="default"
        toolsOpen={rnavopen}
        //toolsWidth={350}
        tools={<SideHelp />}
        navigationOpen={lnavopen}
        onNavigationChange={({ detail }) => navChange(detail)}
        onToolsChange={({ detail }) => toolsChange(detail)}
      />
    );
  } else {
    return (
      <Container>
        <TextContent>Loading . . . </TextContent>
      </Container>
    );
  }
}
export default withAuthenticator(Home);
