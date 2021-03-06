import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './Components/Navigation/Navigation';
import FaceRecognition from './FaceRecognition/FaceRecognition';
import Logo from './Logo/Logo';
import Clarifai from 'clarifai';
import ImageLinkFrom from './ImageLinkForm/ImageLinkForm';
import Rank from './Rank/Rank';
import Signin from './Signin/Signin';
import Register from './Register/Register';
import './App.css';


const app = new Clarifai.App({
  apiKey: '3107cb1329ea4f41a0a0abb9f3afc52f'
});

const particlesOptions = {
  particles: {
                  line_linked: {
                    shadow: {
                      enable: true,
                      color: "#3CA9D1",
                      blur: 5
                    }
                  }
                }
}
class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }


  loadUser = (data) =>{
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined

    }})
  }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }


  displayFaceBox= (box) => {
    this.setState({box: box});
  }

  onInputChange=(event)=>{
    this.setState({input: event.target.value});
  }

  onPictureSubmit=()=>{
    this.setState({imageUrl: this.state.input});
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => {
      if(response) {
        fetch('http://localhost:300/image', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
      })
    })
        .then(response => response.json())
        .then(count => {
          this.setState({user: {
            entries: count
          }})
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err=> console.log(err));
        // there was an error
  }


  onRouteChange=(route) => {
    if(route === 'signout'){
      this.setState({isSignedIn: false})
    }
    else if(route ==='home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
  return (
    <div className="App">
      <Particles className = 'particles'
              params={particlesOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange} />
      {route === 'home' 
        ? <div> 
        <Logo />
        <ImageLinkFrom 
        onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
        <Rank />
        <FaceRecognition box = {box} imageUrl={imageUrl}/>
      </div>

      : (
            route ==='signin'
          ? <Signin loadUser ={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange ={this.onRouteChange}/>
        )      
    }
    </div>
  );
  }
}

export default App;
