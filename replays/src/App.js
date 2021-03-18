// src/App.js

import React, { Component } from 'react';
import ReactPlayer from 'react-player';

import aws_exports from './aws-exports';
import aws_video_config from './aws-video-exports';

import { Header, List, Segment } from 'semantic-ui-react';

import { AmplifyGreetings, AmplifyAuthenticator } from '@aws-amplify/ui-react';
import Amplify, { API, Auth, graphqlOperation, Hub } from 'aws-amplify';

import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import * as subscriptions from './graphql/subscriptions';

Amplify.configure(aws_exports);

//The CloudFront URL for MediaPackage Endpoint that is streaming the video
const mp_url = aws_video_config.awsOutputLiveHLS;

/*const ListReplays = `query ListReplays {
    listReplays {
        items {
            id
            rname
            rurl
            PosVotes
            NegVotes
        }
    }
}`;*/



/*const SubscribeToNewReplays = `
  subscription OnCreateReplay {
    onCreateReplay {
      id
      rname
      rurl
    }
  }
`;
*/

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
        const upVotes = 0
        const downVotes = 0

        //Add a new Replay to the DynamoDB table using AppSync mutation
        /*const ReplayMutation = `mutation NewReplay($rname: String!, $rurl: String!, $PosVotes: Int, $NegVotes: Int) {
            createReplay(input: {rname: $rname, rurl: $rurl, PosVotes: $PosVotes, NegVotes: $NegVotes,}) {
                id
                rname
                rurl
                PosVotes
                NegVotes
            }
        }`;*/

        //const newReplayVars = { rname: rname, rurl: urlstr, upVotes: upVotes, downVotes: downVotes }
        //console.log(newReplayVars)
        
        const result = await API.graphql(graphqlOperation(mutations.createReplay, { input: {rname: rname, rurl: urlstr, upVotes:upVotes, downVotes:downVotes }}));
        console.log('handleClick: graphqlOperation returned: ', result);
    }

    render() {
        return (<button onClick={this.handleClick}> Create New Replay </button>);
    }
}


class DeleteReplay extends Component {
    constructor(props) {
        super(props);
        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick = async (event) => {
        event.preventDefault();
        
        const result = await API.graphql(graphqlOperation(mutations.deleteReplay, { input: {id: this.props.id }}));
        console.log('handleClick: graphqlOperation returned: ', result);
    }
    render() {
        return (<button onClick={this.handleClick}> <h3>Delete</h3> </button>);
    }
}


class VoteReplayUp extends Component {
    constructor(props) {
        super(props);
        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }



    handleClick = async (event) => {
        event.preventDefault();
        const getUpvotes = `query getReplay($id: ID!) {
            getReplay(id:$id) {
              upVotes
            }
          }`;

        const upVotes = await API.graphql(graphqlOperation(getUpvotes, {id:this.props.id}));
        const id = this.props.id;
        console.log('handleClick: graphqlOperation returned: ', upVotes);
        /*const initUpVotes = uPvotes.upVotes
        console.log('id from new class: ', id);   
        console.log('initUpVotes from new class: ', initUpVotes);     
       
        var calcUpVotes = initUpVotes;

        if (calcUpVotes === 0){
            calcUpVotes = 1
        } else {
            calcUpVotes++
        }

        const upVotes = calcUpVotes

        console.log('upvotes from new class: ', upVotes);
       
        const result = await API.graphql(graphqlOperation(mutations.updateReplay, { input: {id:id, upVotes:upVotes}}));      
        console.log('handleClick: graphqlOperation returned: ', result); */
    }
    render() {
        return (<button onClick={this.handleClick}> <h3>New_UpVote</h3> </button>); 
    }
}



class ReplaysList extends React.Component {
  //Each replay is displayed using the ReactPlayer component

  handleClick = (p_id,p_upVotes) => async (event) => {
    console.log(p_id);
    event.preventDefault();
    const id = p_id;  
    var upVotes = p_upVotes;

    if (upVotes === 0){
        upVotes = 1
    } else {
        upVotes++
    }
   
    const result = await API.graphql(graphqlOperation(mutations.updateReplay, { input: {id: id, upVotes: upVotes}}));    
    console.log('handleClick: graphqlOperation returned: ', result);
    console.log('handleClick: positive vote entered, current positive votes= ' , upVotes);

    this.forceUpdate();
     
   }

  replayItems() {
    return this.props.replays.map(replay =>
      <List.Item key={replay.id}>
        <Header as='h2'>Replay: {replay.rname} </Header>
        <ReactPlayer url={replay.rurl} playing muted controls={true} width='50%' height='50%' />
        <div>Replay ID: {replay.id}</div>
        <div>UpVotes: {replay.upVotes}</div>
        <div>DownVotes: {replay.downVotes}</div>
        <button onClick={this.handleClick(replay.id,replay.upVotes)}>Up-Vote</button> 
        <DeleteReplay id={replay.id}/>  
        <VoteReplayUp id={replay.id}/>  
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
    onDeleteReplay = (replay) => {
        // This subscription handler enables near realtime availability of replays to fans
        let updatedData = this.state.data;
        updatedData.listReplays.items = this.state.data.listReplays.items.filter(item => item.id !== replay.value.data.onDeleteReplay.id);
        this.setState(state => ({data: updatedData}));
    }

    async componentDidMount() {
        //Make the query ListReplays
        const result = await API.graphql(graphqlOperation(queries.listReplays));
        //Set the subscription SubscribeToNewReplays with this.onNewReplay as the subscription handler
        const subscriptionNewReplay = await API.graphql(
            graphqlOperation(subscriptions.onCreateReplay)).subscribe({ next: this.onNewReplay } );
        const subscriptionDeleteReplay = await API.graphql(
            graphqlOperation(subscriptions.onDeleteReplay)).subscribe({ next: this.onDeleteReplay });

        //setState to force a new rendering
        console.log('ReplaysListLoader: componentDidMount: NewReplay', result.data, subscriptionNewReplay);
        console.log('ReplaysListLoader: componentDidMount: DeleteReplay', result.data, subscriptionDeleteReplay);
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