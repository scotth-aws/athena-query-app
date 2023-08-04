import React, { useState, useEffect } from "react";
import "./index.css";
//import { withAuthenticator } from "@aws-amplify/ui-react";
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
  Grid

} from "@cloudscape-design/components";
//import { appLayoutLabels } from "../labels";
import Navigation from "../Navigation";
import {
  Logger,
  Auth,
  API,
  graphqlOperation,

} from "aws-amplify";
import { listReports } from "../../graphql/queries";

const Content = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [selectedItems, setSelectedItems] = React.useState([{ name: "" }]);
  const [selectedItemsOutputs, setSelectedItemsOutputs] = React.useState([]);
  const [reports, setReports] = React.useState([]);
  const [description,setDescription] = React.useState("");
  const [summary,setSummary] = React.useState("");
  const [query,setQuery] = React.useState("");
  const [downloadReport,setDownloadReport] = React.useState("");

  const [pagesCount, setPagesCount] = React.useState(
    Math.ceil(reports.length / 5)
  );


  useEffect(() => {
    API.graphql(graphqlOperation(listReports, {})).then((response, error) => {

      console.log('listReports ' + JSON.stringify(response.data.listReports.items));
      setReports(response.data.listReports.items);

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

  //console.log('about to render ' + JSON.stringify(reports));

  function convertEpochToSpecificTimezone(timeEpoch, offset) {
    //Convert epoch to human readable date
    var myDate = new Date(timeEpoch * 1000);
    var hr = myDate.toGMTString();
    console.log(' human readable ' + hr)
    return hr;
  }
  const selectionChangeButton = (detail) => {
    setSummary('Summary : ');
    setDescription('Description : ')
    setDownloadReport('Download Report: ');
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
          <Header
            counter={
              selectedItems.length
                ? "(" + selectedItems.length + "/10)"
                : "(10)"
            }
          >
            Completed Reports
          </Header>
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
      <div><Link>{downloadReport} {selectedItems[0].outputLocation}</Link></div>
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


      /*
            API.graphql(graphqlOperation(listReports, {})).then((response, error) => {
      
              console.log('listReports ' + JSON.stringify(response.data.listReports.items));
              setItems(response.data.listReports.items);
      
            })
            */



    } catch (e) {
      console.log("setUser Error");
      setUser(current_user);

    } finally {
      console.log("finally ");
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
  return (
    <AppLayout
      disableContentPaddings={false}
      navigation={<Navigation User={User} />}
      content={<Content />}
      contentType="default"
      toolsOpen={rnavopen}
      //toolsWidth={350}
      tools={<SideHelp />}
      navigationOpen={lnavopen}
      onNavigationChange={({ detail }) => navChange(detail)}
      onToolsChange={({ detail }) => toolsChange(detail)}
    />
  );
}
export default Home;
