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
} from "@cloudscape-design/components";
//import { appLayoutLabels, itemSelectionLabels } from "../labels";
import Navigation from "../Navigation";
import { useNavigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import awsconfig from "../../aws-exports";
const logger = new Logger("erdLogger", "DEBUG");

Amplify.configure(awsconfig);

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

  var [deploymentHeader, setDeploymentHeader] = useState(
    "Report Generation In Progress, this may take a few minutes"
  );
  const [visible, setVisible] = React.useState(false);
  const [selectValue, setSelectValue] = useState({
    label: "List of all variant genes and coordinates",
    value: "1",
  });
  var [modalStatus, setModalStatus] = useState("MODAL_IN_PROGRESS");

  const modalExit = () => {

    setVisible(false);
    navigate("/");

  };
  const submitFormHandler = (event, selectValue) => {
    console.log('selectValue ' + JSON.stringify(selectValue));
    setDisabled(true);
    setAlertSuccess("success");
    setAlert("Report Generation: \"IN_PROGRESS\"");
    setVisible(true);
    var description = "";
    var name = "";
    var query = "";
    if (selectValue.value === '1') {
      description = 'A report on all variants';
      name = "All variant genes and coordinates";
      query = "SELECT * from \"uf_genomics_reporting\".\"uf_variants\" limit 100";
    } else if (selectValue.value === '2') {
      description = 'A report on all variant genes and coordinates where CADD score >=20 and REVEL >= 0.5 and ClinVar != benign and ClinVar != likely_benign';
      name = "CADD score >=20 and REVEL >= 0.5 and ClinVar != benign and ClinVar != likely_benign";
      query = "SELECT * FROM \"uf_genomics_reporting\".\"uf_variants\" as v JOIN \"uf_genomics_reporting\".\"revel38\" AS a  ON v.variant_id = a.variant_id JOIN uf_genomics_reporting.clinvar as clin on a.variant_id = clin.variant_id WHERE a.revel >= 0.4  AND (clin.clinicalsignificance ='Benign' OR clin.clinicalsignificance = 'Likely benign') limit 100";
    } else {
      description = 'A report on all variant genes and coordinates where ClinVar annotations are likely_pathogenic or pathogenic';
      name = "ClinVar annotations are likely_pathogenic or pathogenic";
      query = "SELECT * FROM \"uf_genomics_reporting\".\"uf_variants\" as v JOIN uf_genomics_reporting.clinvar AS a ON v.variant_id = a.variant_id WHERE  (a.clinicalsignificance='Pathogenic'  OR a.clinicalsignificance = 'Likely pathogenic') limit 100 ";
   
    }
    console.log('name '+name);
    console.log('description '+description);

      var qinput = { input: { id: "",name: name, description: description, query: query, createdAt: 0 } }
      API.graphql(graphqlOperation(createReport, qinput)).then((response, error) => {
   
        console.log('createReport ' + JSON.stringify(response.data));
        navigate("/");



      }).catch((error) => {
        console.log('error ' + JSON.stringify(error));
        setDisabled(false);
        setAlertSuccess("error");
        setAlert("Report Generation: \"FAILED\""+JSON.stringify(error));
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
                label="Select Report and hit Submit"
                errorText={!selectValue && "Select Report"}
              >
                <TextContent></TextContent>

                <Select
                  options={[
                    {
                      label: "All variant genes and coordinates",
                      value: "1",
                    },
                    {
                      label: "CADD score >=20 and REVEL >= 0.5 and ClinVar != benign and ClinVar != likely_benign",
                      value: "2",
                    },
                    {
                      label: "ClinVar annotations are likely_pathogenic or pathogenic",
                      value: "3",
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

function Query() {
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


export default withAuthenticator(Query);;
