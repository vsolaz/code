// src/App.js

import React, { Component } from 'react';
import ReactPlayer from 'react-player';

import aws_exports from './aws-exports';
import aws_video_config from './aws-video-exports';

import { Header, List, Segment } from 'semantic-ui-react';

import { AmplifyGreetings, AmplifyAuthenticator } from '@aws-amplify/ui-react';
import Amplify, { API, Auth, graphqlOperation, Hub } from 'aws-amplify';

Amplify.configure(aws_exports);

//The CloudFront URL for MediaPackage Endpoint that is streaming the video
const mp_url = aws_video_config.awsOutputLiveHLS;

const ListReplays = `query ListReplays {
    listReplays {
        items {
            id
            rname
            rurl
            upVotes
            downVotes
        }
    }
}`;

const SubscribeToNewReplays = `
  subscription OnCreateReplay {
    onCreateReplay {
      id
      rname
      rurl
    }
  }
`;

//Implement the mechanism that the operator can use to create a new replay
class NewReplay extends Component {
    constructor(props) {
        super(props);
        
        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        
    }
    
    handleClick = async (event) => {
        event.preventDefault();
        
        const latency=40; //There is a latency of about 30 seconds due to IP streaming. This number can be adjusted based on observed latency for the operator.
        const clipLength=20; //Keeping the Replay logic simple. Assume the clip length to be 20 seconds.
        const d = new Date();
        const n = Math.floor(d.getTime()/1000.0); //Get the UNIX epoch time in seconds
        const start = n - (latency + clipLength); //Start of the clip in UNIX epoch seconds
        const end = n - latency; //End of the clip in UNIX epoch seconds
        const urlstr = mp_url + '?start=' + start + '&end=' + end; //Encoded URL to get the Replay clip
        const rname = prompt('Enter Replay Name:'); //Get a name for the Replay clip from the operator. Note that the start and end time are already registered.
        const upVotes = 0;
        const downVotes = 0;
        //Add a new Replay to the DynamoDB table using AppSync mutation
        const ReplayMutation = `mutation NewReplay($rname: String!, $rurl: String!, $upVotes: Int, $downVotes: Int) {
            createReplay(input: {rname: $rname, rurl: $rurl, upVotes: $upVotes, downVotes: $downVotes,}) {
                id
                rname
                rurl
                upVotes
                downVotes
            }
        }`;
        const result = await API.graphql(graphqlOperation(ReplayMutation, { rname: rname, rurl: urlstr, upVotes: upVotes, downVotes: downVotes, }));
        console.log('handleClick: graphqlOperation returned: ', result);
    }

    render() {
        return (<button onClick={this.handleClick}> Create New Replay </button>);
    }
}

class ReplaysList extends React.Component {
  //Each replay is displayed using the ReactPlayer component

  handleClick = async (event) => {
    event.preventDefault();
    console.log('handleClick: positive vote entered: ');
    const upVotes = 1;
    const downVotes = 0;
    const id = "490b9572-54d4-43e1-8fed-1f5f4273e8f3";
    const ReplayMutation = `mutation NewReplay($id: Int!, $upVotes: Int, $downVotes: Int) {
        updateReplay(input: {id: $id, upVotes: $upVotes, downVotes: $downVotes,}) {
            id
            upVotes
            downVotes
        }
    }`;

    
    const result = await API.graphql(graphqlOperation(ReplayMutation, { id: id, upVotes: upVotes, downVotes: downVotes }));
    console.log('handleClick: graphqlOperation returned: ', result);

   }

  replayItems() {
    return this.props.replays.map(replay =>
      <List.Item key={replay.id}>
        <Header as='h1'>Replay: {replay.rname} </Header>
        <ReactPlayer url={replay.rurl} playing muted controls={true} width='100%' height='100%' />
        <div>{replay.upVotes}</div>
        <button onClick={this.handleClick}>  Positive Votes </button>
      </List.Item>
    );
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>List of Replays</Header>
        <List divided relaxed>
          {this.replayItems()}
        </List>
      </Segment>
    );
  }
}

class ReplaysListLoader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data : {
                listReplays: { items: [] }
            }
        };
    }
    onNewReplay = (replay) => {
        // This subscription handler enables near realtime availability of replays to fans
        let updatedData = this.state.data;
        updatedData.listReplays.items = this.state.data.listReplays.items.concat([replay.value.data.onCreateReplay]);
        this.setState(state => ({data: updatedData}));
    }
    
    async componentDidMount() {
        //Make the query ListReplays
        const result = await API.graphql(graphqlOperation(ListReplays));
        //Set the subscription SubscribeToNewReplays with this.onNewReplay as the subscription handler
        const subscription = await API.graphql(
            graphqlOperation(SubscribeToNewReplays)).subscribe({ next: this.onNewReplay } );
        //setState to force a new rendering
        console.log('ReplaysListLoader: componentDidMount:', result.data, subscription);
        this.setState(state => ({
            data: result.data
        }));
    }
    
    render() {
        return (<ReplaysList replays={this.state.data.listReplays.items} />);
    }
}

class PlayStream extends Component {
    //Live video stream for the operator to view
    render() {
        return (
            <div>
                <Header as='h1'>Live Stream </Header>
                <ReactPlayer url={mp_url} playing muted controls={true} width='100%' height='100%' />
            </div>
        );
    }
}

class App extends Component { 
    constructor(props) {
        super(props);
        this.state = {
          uname: ''
        };
    }
    
    async onAuthEvent(payload) {
        if (payload.event === 'signIn') {
            this.setState({uname: payload.data.username});
        }
    }
    async componentDidMount() {
        try {
            // When the main App component is mounted, wait to get authenticated user
            let user = await Auth.currentAuthenticatedUser();
            //Enforce a new render with the authenticated user details
            this.setState({uname: user.username});
        } catch {
            //User is not authenticated yet. Register an envent handler to set the uname
            //and then enforce a render
            Hub.listen('auth', (data) => {
                const { payload } = data;
                this.onAuthEvent(payload);           
            });
            this.setState({uname: ''}); 
        }
    }
    cleanup () {
        window.location.reload();
    }
    
    render() { 
        return (
            <div>
                <AmplifyAuthenticator>
                    <AmplifyGreetings username={this.state.uname} slot="greetings" handleAuthStateChange={this.cleanup} />
                    <div>
                        {this.state.uname === 'operator' && (
                            <div>
                                <PlayStream />
                                <NewReplay />
                            </div>
                        )}
                        {this.state.uname !== '' && (
                            <ReplaysListLoader />
                        )}
                    </div>
                </AmplifyAuthenticator>
            </div>
        );
    }
}

export default App;