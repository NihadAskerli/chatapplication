const url = 'http://localhost:8080';
let stompClient;
let selectedUser;
let newMessages = new Map();

function connectToChat(userName) {
    console.log("connecting to chat...")
    let socket = new SockJS(url + '/chat');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log("connected to: " + frame);
        stompClient.subscribe("/topic/messages/" + userName, function (response) {
            let data = JSON.parse(response.body);
            if (selectedUser === data.fromLogin) {
                render(data.message, data.fromLogin);
            } else {
                newMessages.set(data.fromLogin, data.message);
                $('#userNameAppender_' + data.fromLogin).append('<span id="newMessage_' + data.fromLogin + '" style="color: red">+1</span>');
            }
        });
    });
}

function sendMsg(from, text) {
    stompClient.send("/app/chat/" + selectedUser, {}, JSON.stringify({
        fromLogin: from,
        message: text
    }));
}

function registration() {
    let userName = document.getElementById("userName").value;
    $.get(url + "/registration/" + userName, function (response) {
        connectToChat(userName);
    }).fail(function (error) {
        if (error.status === 400) {
            alert("Login is already busy!")
        }
    })
}

function selectUser(userName) {
    console.log("selecting users: " + userName);
    selectedUser = userName;
    let isNew = document.getElementById("newMessage_" + userName) !== null;
    if (isNew) {
        let element = document.getElementById("newMessage_" + userName);
        element.parentNode.removeChild(element);
        render(newMessages.get(userName), userName);
    }
    $('#selectedUserId').html('');
    $('#selectedUserId').append('Chat with ' + userName);
}

function fetchAll() {
    $.get(url + "/fetchAllUsers", function (response) {
        let users = response;
        let usersTemplateHTML = "";
        for (let i = 0; i < users.length; i++) {
            usersTemplateHTML = usersTemplateHTML + '<a href="#" onclick="selectUser(\'' + users[i] + '\')"><li class="clearfix">\n' +
                '                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAB9CAMAAAC4XpwXAAAAYFBMVEX///8AAADw8PA0NDTCwsLGxsb4+Pj19fXW1tZ7e3ucnJwpKSkxMTHJycm6urqvr69ra2tgYGAgICCHh4c5OTmoqKjj4+NMTEzQ0NA/Pz8SEhJVVVUZGRnc3NyTk5NlZWXEd9MwAAACwElEQVRoge2aW7aiMBBFSZSXIE8BxavOf5a30+CCVhpSlQN+mD0A9xKSk6IqjmOKTPLCM/4VFr6btUI8PuK+lSehcLdX+2kueoKt3UEpBo6bqmUViTHxhqsuCFvxSiI3UXtu/qZW7MKkXtvtV82kuyMvj/6K8sOMuidcawVWy+6/pCu467ln/i/NDS0/v6/zGcCP/0hx/2GPlN+Icmj4+jHZHuH2Xrlse6NEySVDLgQq+jRCZoIDyE5/64odRu6x5EJgjt2Aacdsuj3Tjkkca7d2a/8eu2vt1k4A01Owdmv/NnvCtCcQ+4NpzwBueWHKhbiYN7LubLkQd2M77yOuw/xTjltbKMzPmdrAbv4RLXdseQxon3I3nBC5uZzVNulANE+4UYdpWvKXHaJlyW1dgJoXV6a8QcjZyw7TsUuZdkyn/LM9K2d6ErMEImsUvIMGU9o4jv/DkP/AmtSc8uaCkn+2Q8568bjZCH0wggn5HnrYXnFyRmmJmg0oauqea6EjYeqqx614hU8aRYoWPIumDSPh10BCgjxEyx2p/+zbFa5BRMvanggvdwpte4GXS/0tv8KTp2Q9/O6BcybYz3A75YMKVVQNUOpq/K0TyjGHPOA6Ppt1lBYGaPQ+QKsvsI9e6sdsR4QMHMpL7wC++lo/458UuNKK07rBJQ6newErqQmFxQDsoOP1zECP3md2DxB1rVfRF3xHURn3TlJqzoyJzA67hLPexrT8t+/yRzIDF96XRcDtUb5ypV+4qjOQW5HRYlfSj5V5Qv3sgbsJfmkygZvjvuz3DyYbfJ7osBB/Ke8OpS7xXPwkp1XditP/4me/7v9+Ek/1Ec/6N9RNaV6/8wL+zI/DYxx/0GDTY4g/6uV4DP0Nf2+7Nz6m6WoPgymzCTtp7dZu7db+Pfb1K5opTn2Ruf35qnhev5Of0Gfqr/8C4o8vCddFVegAAAAASUVORK5CYII=" width="55px" height="55px" alt="avatar" />\n' +
                '                <div class="about">\n' +
                '                    <div id="userNameAppender_' + users[i] + '" class="name">' + users[i] + '</div>\n' +
                '                    <div class="status">\n' +
                '                        <i class="fa fa-circle offline"></i>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '            </li></a>';
        }
        $('#usersList').html(usersTemplateHTML);
    });
}
