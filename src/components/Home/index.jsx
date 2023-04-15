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

} from "@cloudscape-design/components";
//import { appLayoutLabels } from "../labels";
import Navigation from "../Navigation";
import {
  Logger,
  Auth,
  API,
  graphqlOperation,

} from "aws-amplify";

const Content = (user) => {
  
  const [selectedItems, setSelectedItems] = React.useState([{ name: "Item 2" }]);



  console.log('about to render ');
  return (
    <div className="container">
   

   <Table
      onSelectionChange={({ detail }) =>
        
        setSelectedItems(detail.selectedItems)
      }
      selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: ({ selectedItems }) =>
          `${selectedItems.length} ${
            selectedItems.length === 1 ? "item" : "items"
          } selected`,
        itemSelectionLabel: ({ selectedItems }, item) => {
          const isItemSelected = selectedItems.filter(
            i => i.name === item.name
          ).length;
          return `${item.name} is ${
            isItemSelected ? "" : "not"
          } selected`;
        }
      }}
      columnDefinitions={[
        {
          id: "variable",
          header: "Variable name",
          cell: e => e.name,
          sortingField: "name"
        },
        {
          id: "value",
          header: "Text value",
          cell: e => e.alt,
          sortingField: "alt"
        },
        { id: "type", header: "Type", cell: e => e.type },
        {
          id: "description",
          header: "Description",
          cell: e => e.description
        }
      ]}
      items={[
        {
          name: "Item 1",
          alt: "First",
          description: "This is the first item",
          type: "1A",
          size: "Small"
        },
        {
          name: "Item 2",
          alt: "Second",
          description: "This is the second item",
          type: "1B",
          size: "Large"
        },
        {
          name: "Item 3",
          alt: "Third",
          description: "-",
          type: "1A",
          size: "Large"
        },
        {
          name: "Item 4",
          alt: "Fourth",
          description: "This is the fourth item",
          type: "2A",
          size: "Small"
        },
        {
          name: "Item 5",
          alt: "-",
          description:
            "This is the fifth item with a longer description",
          type: "2A",
          size: "Large"
        },
        {
          name: "Item 6",
          alt: "Sixth",
          description: "This is the sixth item",
          type: "1A",
          size: "Small"
        }
      ]}
      loadingText="Loading resources"
      selectionType="multi"
      trackBy="name"
      visibleColumns={[
        "variable",
        "value",
        "type",
        "description"
      ]}
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
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
          Table with common features
        </Header>
      }
      pagination={
        <Pagination
          currentPageIndex={1}
          pagesCount={2}
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
              "variable",
              "value",
              "type",
              "description"
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
                    id: "variable",
                    label: "Variable name",
                    editable: false
                  },
                  { id: "value", label: "Text value" },
                  { id: "type", label: "Type" },
                  {
                    id: "description",
                    label: "Description"
                  }
                ]
              }
            ]
          }}
        />
      }
    />
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
      content={<Content username={User} />}
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
