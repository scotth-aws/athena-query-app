import React, { useState, useEffect } from "react";
import "./index.css";

import {
  Logger,
  Auth,
  API,
  graphqlOperation,
} from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createReport } from "../../graphql/mutations";
import "@aws-amplify/ui-react/styles.css";
import {
  AppLayout,
  Box,
  Header,
  HelpPanel,
  Button,
  Form,
  Container,
  FormField,
  TextContent,
  Select,
  Link,
  SpaceBetween,
  Modal,
  Multiselect,
} from "@cloudscape-design/components";
//import { appLayoutLabels, itemSelectionLabels } from "../labels";
import Navigation from "../Navigation";
import { useNavigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import awsconfig from "../../aws-exports";
const logger = new Logger("erdLogger", "DEBUG");

Amplify.configure(awsconfig);

const clinsig = [
  {
    label: "Pathogenic",
    options: [
      {
        label: "Pathogenic; drug response",
        value: "1",
        description: ""
      },
      {
        label: "Pathogenic/Likely risk allele",
        value: "2",
        description: ""
      },
      {
        label: "Pathogenic; risk factor",
        value: "3",
        description: ""
      },
      {
        label: "Likely pathogenic; other",
        value: "4",
        description: ""
      }

    ]
  },
  {
    label: "Benign",
    options: [
      {
        label: "Benign; risk factor",
        value: "5",
        description: ""
      },
      {
        label: "Benign/Likely benign; association",
        value: "6",
        description: ""

      }
    ]
  },
  {
    label: "Uncertain",
    options: [
      {
        label: "Uncertain significance; risk factor",
        value: "7",
        description: ""
      },
      {
        label: "Uncertain risk allele; protective",
        value: "8",
        description: ""
      }
    ]
  }
]

const Content = (user) => {
  //console.log("Content username " + JSON.stringify(user));

  var token = user.username.token;
  var cuser = user.username.username;
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const [linkDisabled, setLinkDisabled] = useState(true);
  const [alert, setAlert] = useState("");
  const [alertColor, setAlertColor] = React.useState("blue");
  const [headerColor, setHeaderColor] = React.useState("#000066");
  const [outputs, setOutputs] = useState("");
  var [alertDismissible, setAlertDismissible] = useState(false);
  var [alertSuccess, setAlertSuccess] = useState("success");
  var [selectedClinvarOptions, setSelectedClinvarOptions] = React.useState([
    {
      label: "Pathogenic",
      value: "1",
      description: ""
    }
  ]);

  var [deploymentHeader, setDeploymentHeader] = useState(
    "Report Generation In Progress, this may take a few minutes"
  );
  const [visible, setVisible] = React.useState(false);
  const [selectValue, setSelectValue] = useState({
    label: "Sample Variants from Johnny B",
    value: "1",
  });
  const [selectGeneValue, setSelectGeneValue] = useState({
    label: "1",
    value: "1",
  });
  var [modalStatus, setModalStatus] = useState("MODAL_IN_PROGRESS");

  const modalExit = () => {

    setVisible(false);
    navigate("/");

  };
  const clinvarSelection = (details) => {
    console.log('detail ' + JSON.stringify(details));
    setSelectedClinvarOptions(details.detail.selectedOptions)


  };
  const submitFormHandler = (event, selectValue) => {

    console.log('submitFormHandler selectValue ' + JSON.stringify(selectValue) + '  ' + JSON.stringify(selectedClinvarOptions) + ' ' + JSON.stringify(selectGeneValue));
    setDisabled(true);
    setAlertSuccess("success");
    setAlert("Report Generation: \"IN_PROGRESS\"");
    setVisible(true);
    var description = "";
    var name = "";
    var query = "";
    /*
    if (selectValue.value === '1') {
      description = 'A report on all variants';
      name = "List of all variant genes and coordinates";
      query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 100";
    } else if (selectValue.value === '2') {
      description = 'A report on all variants where CADD score >=2';
      name = "List of all variant genes and coordinates where CADD score >=20";
      query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 100";
    } else {
      description = 'A report on all variants where ClinVar annotations are likely_pathogenic or pathogenic';
      name = "List of all variant genes and coordinates where ClinVar annotations are likely_pathogenic or pathogenic";
      query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 100";
    }
    */
    var clinvarSigs = '';
    var clinvarPredicate = ''
    for (var i = 0; i < selectedClinvarOptions.length; i++) {
      clinvarSigs = clinvarSigs + selectedClinvarOptions[i].label;
      clinvarPredicate = clinvarPredicate + "a.clinicalsignificance = " + "'"+selectedClinvarOptions[i].label+"'";
      if (i < selectedClinvarOptions.length - 1) {
        clinvarSigs = clinvarSigs + ' OR ';
        clinvarPredicate = clinvarPredicate + ' OR ';
      
      }


    }
    console.log('clinvarPredicate '+clinvarPredicate);
    description = 'A report on all variants for specific gene and clinvar significance';
    name = 'List of all variants where gene is ' + selectGeneValue.value + ' and clinvar significance is ' + clinvarSigs;
    //query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 100";
    query = "SELECT * FROM \"uf_genomics_reporting\".\"uf_variants\" AS v JOIN uf_genomics_reporting.clinvar AS a ON v.variant_id = a.variant_id WHERE  ("+ clinvarPredicate +") and v.chrom = '" + selectGeneValue.value + "' limit 100 ";

    console.log('name ' + name);
    console.log('description ' + description);

    var qinput = { input: { id: "", name: name, description: description, query: query, createdAt: 0 } }
    API.graphql(graphqlOperation(createReport, qinput)).then((response, error) => {

      console.log('createReport ' + JSON.stringify(response.data));
      navigate("/");

    }).catch((error) => {
      console.log('error ' + JSON.stringify(error));
      setDisabled(false);
      setAlertSuccess("error");
      setAlert("Report Generation: \"FAILED\"" + JSON.stringify(error));
      setVisible(true);
    })



  };
  return (
    <div id="top" className="ec2App">
      <SpaceBetween direction="vertical" size="l">
        <Container variant="stacked"
          header={
            <Header variant="h3">
              <strong style={{ color: headerColor }}>
                Generate Genomics Reports
              </strong>
            </Header>
          }
        ></Container>

        <Form
          actions={
            <Container>
              <Button onClick={(event) => navigate("/")} variant="link">
                Home
              </Button>
              <Button
                variant="primary"
                disabled={disabled}
                onClick={(event) => submitFormHandler(event, selectValue)}
              >
                Submit
              </Button>
            </Container>
          }
        >
          <Container
            header={<Header variant="h3">Report Configuration</Header>}
          >
            <SpaceBetween direction="vertical" size="s">
              <FormField
                label="Select Variants Table"
                errorText={!selectValue && "Select Variants Table"}
              >
                <TextContent></TextContent>

                <Select
                  options={[
                    {
                      label: "Sample Variants from Johnny B",
                      value: "1",
                    },
                    {
                      label: "Some other Variant table from Rui",
                      value: "2",
                    }

                  ]}
                  selectedOption={selectValue}
                  onChange={(event) =>
                    setSelectValue(event.detail.selectedOption)
                  }
                  selectedAriaLabel="selected"
                />
              </FormField>
            </SpaceBetween>

            <SpaceBetween direction="vertical" size="s">
              <FormField
                label="Select Gene"
                errorText={!selectValue && "Select Gene"}
              >
                <TextContent></TextContent>

                <Select
                  options={[
                    {
                      label: "1",
                      value: "1",
                    },
                    {
                      label: "2",
                      value: "2",
                    },
                    {
                      label: "3",
                      value: "3",
                    },
                    {
                      label: "4",
                      value: "4",
                    },
                    {
                      label: "5",
                      value: "5",
                    },
                    {
                      label: "6",
                      value: "6",
                    },
                    {
                      label: "7",
                      value: "7",
                    },
                    {
                      label: "8",
                      value: "8",
                    },
                    {
                      label: "9",
                      value: "9",
                    },
                    {
                      label: "10",
                      value: "10",
                    },
                    {
                      label: "11",
                      value: "11",
                    },
                    {
                      label: "12",
                      value: "12",
                    },
                    {
                      label: "13",
                      value: "13",
                    },
                    {
                      label: "14",
                      value: "14",
                    },
                    {
                      label: "15",
                      value: "15",
                    },
                    {
                      label: "16",
                      value: "16",
                    },
                    {
                      label: "17",
                      value: "17",
                    },
                    {
                      label: "18",
                      value: "18",
                    },
                    {
                      label: "19",
                      value: "19",
                    },
                    {
                      label: "20",
                      value: "20",
                    },
                    {
                      label: "21",
                      value: "21",
                    },
                    {
                      label: "22",
                      value: "22",
                    },

                  ]}
                  selectedOption={selectGeneValue}
                  onChange={(event) =>
                    setSelectGeneValue(event.detail.selectedOption)
                  }
                  selectedAriaLabel="selected"
                />
              </FormField>
            </SpaceBetween>

            <SpaceBetween direction="vertical" size="s">
              <FormField
                label="Select Clinvar Options"
                errorText={!selectValue && "Select Clinvar Options"}
              >
                <TextContent></TextContent>

                <Multiselect
                  selectedOptions={selectedClinvarOptions}
                  onChange={(details) =>
                    clinvarSelection(details)
                  }
                  options={clinsig}
                  placeholder="Choose options"
                />
              </FormField>
            </SpaceBetween>


            <SpaceBetween direction="vertical" size="s">
              <TextContent></TextContent>
              <Link
                external
                variant="primary"
                externalIconAriaLabel=""
                href="https://neurology.ufl.edu/divisions/lnn/"
                disabled={linkDisabled}
              >
                Learn more about these Reports
              </Link>
            </SpaceBetween>
            <Box>
              <Modal
                onDismiss={() => modalExit()}
                visible={visible}
                closeAriaLabel="Close modal"
                footer={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs"></SpaceBetween>
                  </Box>
                }
                header={deploymentHeader}
              >
                <TextContent>
                  <strong style={{ color: alertColor }}>{alert}</strong>
                </TextContent>
                <TextContent></TextContent>
              </Modal>
            </Box>
          </Container>

        </Form>
      </SpaceBetween>
    </div>
  );
};

const SideHelp = () => (

  <HelpPanel header={<h2>Variant Report Help</h2>}>
    <SpaceBetween size="m">
      <Box>
        <strong>This is where help around the report generation will be</strong>

      </Box>

    </SpaceBetween>

  </HelpPanel>
);

function QueryFilterGeneClinVar() {
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
          current_user.isLoggedIn = true;
          current_user.username = user.username;
          current_user.token = user.signInUserSession.idToken["jwtToken"];
          if (process.env.NODE_ENV === 'development')
            console.log('Auth.currentAuthenticatedUser called current user is ' + user.username);
          if (
            user.signInUserSession.idToken.payload["cognito:groups"] !==
            undefined
          )
            current_user.isAdmin = true;
          setUser(current_user);
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
      logger.error(
        "Admin -> index.jsx - useEffect error " + JSON.stringify(e),
        Date.now()
      );
    } finally {
      console.log("finally ");
    }
  }, []);
  //console.log("User " + JSON.stringify(User));
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
  } else {
    return (
      <Container>
        <TextContent>Loading . . . </TextContent>
      </Container>
    );
  }
}


export default withAuthenticator(QueryFilterGeneClinVar);;
