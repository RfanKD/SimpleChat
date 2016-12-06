window.onload = function () {
    var simpleChat = new SimpleChat();
    simpleChat.init();
};

var SimpleChat = function(){
    this.socket = null;
};

SimpleChat.prototype = {
    init: function(){

        var that = this;

        this.socket = io.connect();

        document.getElementById('loginBtn').addEventListener('click', function(){

                    var nickName = document.getElementById('nicknameInput').value;

                    if(nickName.trim().length != 0){
                        that.socket.emit('login', nickName);
                    }else {
                        document.getElementById('nicknameInput').focus();
                    };
        }, false);

        document.getElementById('sendBtn').addEventListener ('click', function(){
             var messageInput = document.getElementById('messageInput');
             var msg = messageInput.value;
             var color = document.getElementById('colorStyle').value;

             messageInput.value = '';
             messageInput.focus();

             if (msg.trim().length != 0){
                   that.socket.emit('postMsg', msg, color);
                   that._displayNewMsg('me', msg, color);
             };

        });

        document.getElementById('sendImage').addEventListener ('change', function(){
            console.log("in here");

            if (this.files.length != 0){
                console.log("in here");
                var file = this.files[0];
                var reader = new FileReader();
                 var color = document.getElementById('colorStyle').value;

                if (!reader ){
                    that._displayNewMsg('system','!your browser doesn\'t support FileReader','red' );
                    this.value ='';
                    return ;
                };

                reader.onload = function(e){
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('me', e.target.result, color);
                };

                reader.readAsDataURL(file);
                console.log(file);
            };
        });

        document.getElementById('nicknameInput').addEventListener('keyup',function(e){
            
            if (e.keyCode == 13){
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0){
                    that.socket.emit('login', nickName);
                };
            };

        }, false);

        document.getElementById('messageInput').addEventListener('keyup',function(e){
            
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            var color = document.getElementById('colorStyle').value;

            if (e.keyCode == 13 && msg.trim().length!= 0){
                messageInput.value = '';
                that.socket.emit ('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            };
            
        }, false);

        this.socket.on('connect',function(){
            document.getElementById('info').textContent = 'get yourself a nickname';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();

        });

        this.socket.on('nickExisted', function(){
             document.getElementById('info').textContent = '!nickname is taken, choose another please';
        });

        this.socket.on('loginSuccess', function(){
            document.title = 'Simple Chat | Hi ' +
            document.getElementById('nicknameInput').value;

            document.getElementById('loginWrapper').style.display = "none";

            document.getElementById('messageInput').focus();
        });

        this.socket.on('system', function(nickName, userCount, type){

            var msg = nickName + (type =='login'?' joined':' left');
            var p = document.createElement('p');

           // p.textContent = msg;
            document.getElementById('historyMsg').appendChild(p);
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users ' : ' user ') + ' online ';

            that._displayNewMsg ('system ', msg, 'red');
        });


        this.socket.on('newMsg', function(user, msg, color){
            that._displayNewMsg (user, msg, color);
        });
        
        this.socket.on('newImg', function(user, img){
            that._displayImage (user, img);
        });

        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e){
            var emojiWrapper = document.getElementById('emojiWrapper');
            emojiWrapper.style.display = 'block';
            e.stopPropagation();

        }, false);

        document.body.addEventListener('click',function(e){
            var emojiWrapper = document.getElementById('emojiWrapper');
          
            if (e.target != emojiWrapper){
                emojiWrapper.style.display = 'none';
            };
        });

        document.getElementById('emojiWrapper').addEventListener('click', function(e){
            var target = e.target ;
            if(target.nodeName.toLowerCase() == 'img'){
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title +']';
            };

        }, false);



    },

    _showEmoji: function(msg){
        var match, result = msg;
        var reg = /\[emoji:\d+\]/g;
        var emojiIndex;
        var totalEmojiNum = document.getElementById('emojiWrapper').children.length;

        while (match = reg.exec(msg)){
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum){
                result = result.replace(match[0],'[X]');
            }else{
                result = result.replace(match[0],
                '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif"/>');
            };

        };
        return result;
    },

    _displayNewMsg: function(user, msg, color){
        var container = document.getElementById ('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);

        msg =this._showEmoji(msg);

        if (user != null){
            msgToDisplay.style.color = color || '#000';
            msgToDisplay.innerHTML = user + '<span class="timespan"> (' + date +'): </span>'+ msg;    
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;

        };
    },

    _displayImage: function(user, imgData, color){
        var container = document.getElementById ('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);
        var htmlCode ;

        if (user != null){
            msgToDisplay.style.color = color || '#000';
            htmlCode =user + '<span class="timespan"> (' + date +'): </span><br/><a href="'+imgData+'" target="_blank"><img src="'+ imgData +'"/></a>';

            msgToDisplay.innerHTML = htmlCode; 

            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;

        };
    },

    _initialEmoji: function(){
        var emojiContainer = document.getElementById('emojiWrapper');
        var docFragment = document.createDocumentFragment();

        for (var i= 69 ; i > 0; i--){
            var emojiItem =document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i ;
            docFragment.appendChild (emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    }
};

