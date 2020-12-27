const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3000,
  path: '/peer'
})
let myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {};
let count = 0;
var c = 0;

document.querySelector(".link input").value = window.location.href;

document.querySelector(".btn-cancel")
  .addEventListener("click", () => {
    window.location.href = "/"
  })

myPeer.on("call", (call, id) => {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    console.log("call", call, id)
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
      count++;
    })
    call.on("close", () => {
      video.remove()
    })
  })
  console.log("calling")
})
// Camera access
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  // myPeer.on('call', call => {
  //   console.log("call")
  //   call.answer(stream)
  //   const video = document.createElement('video')
  //   call.on('stream', userVideoStream => {
  //     addVideoStream(video, userVideoStream)
  //   })
  // })

  socket.on('user-connected', userId => {
    console.log("user connected")
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  console.log("disconnected", userId)
  // count.filter((id) => {
  //   if (id == userId) {
  //     return false
  //   } else {
  //     return true
  //   }
  // })
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log("open")
})

function connectToNewUser(userId, stream) {
  console.log("try to send stream", userId, stream)
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
    count++
  })
  call.on('close', () => {
    video.remove()
    console.log("No.", (Object.keys(peers)).length)
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

document.querySelector(".link div").addEventListener("click", named)

function copyText() {
  var copyText = document.getElementById("myInput") ;
  copyText.select();  
  // console.log("Copied",copyText)
  // document.execCommand("copy",false,"hello");
  // console.log("Copied")
  // alert("Copied the text: " + copyText.value);
  const textToCopy = 'Hello there!'
  navigator.clipboard.writeText(copyText.value)
    .then(() => { alert(`Copied!`) })
    .catch((error) => { alert(`Copy failed! ${error}`) })
}

function named(event) {
  // Select the email link anchor text
  var emailLink = document.querySelector('#myInput');
  var range = document.createRange();
  range.selectNode(emailLink);
  window.getSelection().addRange(range);

  try {
    // Now that we've selected the anchor text, execute the copy command
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copy email command was ' + msg);
    alert("Link copied")
  } catch(err) {
    console.log('Oops, unable to copy');
  }
  window.getSelection().removeAllRanges();
} ;