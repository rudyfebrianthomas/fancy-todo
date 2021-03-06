let baseUrl = 'http://localhost:3000'

let projectId = null

function newTodo() {
    let datearr = $('#todo-date').val().split('/')
    let date = datearr[2] + '-' + datearr[0] + '-' +datearr[1]
    let data = {}

    if (projectId){
        data = {
            name: $('#todo-name').val(),
            description: $('#todo-desc').val(),
            dueDate: date,
            projectId: projectId
        }
    }else{
        data = {
            name: $('#todo-name').val(),
            description: $('#todo-desc').val(),
            dueDate: date
        }
    }

    $.ajax({
            method: "POST",
            url: `${baseUrl}/todos`,
            headers: {
                token: localStorage.getItem('token')
            },
            data: data
        })
        .done(resp => {
            console.log(resp, 'add todo')
            swal({
                icon: "success",
                text: "Success Add Todo"
            })
            todo()
            $('#todo-name').val(''),
            $('#todo-desc').val(''),
            $('#todo-date').val('')
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus, jqXHR)
            swal({
                icon: "warning",
                text: "Add Todo Failed, Check The Format"
            })
        })
}

function onSignIn(googleUser) {
    var idToken = googleUser.getAuthResponse().id_token;

    $.ajax({
            method: "POST",
            url: `${baseUrl}/users/googlesignin`,
            data: {
                idToken
            }
        })
        .done(resp => {
            $('#loginform').hide()
            $('.nb').show()
            $('#main').show()
            $('#todomain').show()
            $('#projectmain').hide()
            
            localStorage.setItem("token", resp.token)
            localStorage.setItem("userName", resp.userName)
            todo()
            swal({
                icon: "success",
                title: "Success Login!",
                text: "Welcome, " + localStorage.getItem('userName')
            })
            fetchuserName()
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus)
            swal({
                icon: "warning",
                text: "Email/Password Wrong"
            })
        })
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();

    $('.nb').hide()
    $('#clickhere').show()
    $('#main').hide()

    localStorage.clear()
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

function todo() {
    $.ajax({
            method: "GET",
            url: `${baseUrl}/todos`,
            headers: {
                token: localStorage.getItem('token')
            }
        })
        .done(resp => {
            $('#todolist').empty()
            resp.forEach(resp => {
                let date = resp.dueDate.substr(0, 10).split('-').reverse().join('-')
                $('#todolist').append(`
                <div class="card" style="width: 15rem; height:16rem; margin-right:15px; margin-top:50px; color: white; text-align: center; background-color:#373C42">
                    <div class="card-body">
                    <h5 class="card-title"><b>${resp.name}</b></h5>
                    <h6 class="card-subtitle mb-2">===========</h6>
                    <p class="card-text">Status: ${resp.status}</p>
                    <p class="card-text">Due Date: ${date}</p>
                    <button type="button" class="btn btn-outline-primary" style="margin-bottom:10px;" onclick="detailtodo('${resp.name}','${resp.description}','${resp.status}','${date}')">Detail</button><br>
                    <button type="button" class="btn btn-outline-warning" style="margin-right:5px;" data-target="#edittodomodal" data-toggle="modal" onclick="edittodo('${resp._id}')">Edit</button>
                    <button type="button" class="btn btn-outline-danger" onclick="deletetodo('${resp._id}')">Delete</button>
                    </div>
                </div>
                `)
            });
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus)
            swal({
                icon: "warning",
                text: "Cannot Get Todos"
            })
        })
}

function detailtodo(title, desc, status, date) {
    swal({
        title: title,
        text: `

        Description: 
        
        ${desc}

        Status: ${status}

        Due Date: ${date}
        `
    })
}

function deletetodo(id) {
    swal({
            title: "Are you sure?",
            text: "Deleted Todo Cannot Be Restore",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                        method: "DELETE",
                        url: `${baseUrl}/todos/${id}`,
                        headers: {
                            token: localStorage.getItem('token')
                        }
                    })
                    .done(resp => {
                        swal({
                            icon: "success",
                            text: "Success Delete Todo"
                        })
                        todo()
                    })
                    .fail((jqXHR, textStatus) => {
                        console.log(textStatus)
                        swal({
                            icon: "warning",
                            text: "Delete Todo Failed"
                        })
                    })
            } else {
                swal({
                    icon: "success",
                    text: "Your Todo Is Not Deleted"
                });
            }
        });
}

function edittodo(id) {
    $.ajax({
            method: "GET",
            url: `${baseUrl}/todos/${id}`,
            headers: {
                token: localStorage.getItem('token')
            }
        })
        .done(resp => {
            let datearr = resp.dueDate.substr(0, 10).split('-')
            let date = datearr[1] + '/' + datearr[2] + '/' +datearr[0]
            $('#edit-name').val(`${resp.name}`),
            $('#edit-desc').val(`${resp.description}`),
            $('#edit-date').val(`${date}`)
            $("#edit-status select").val(`${resp.status}`);
            $('#editbutton').empty()
            $('#editbutton').append(`
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="submitedittodo('${resp._id}')" data-dismiss="modal">Edit Todo</button>
            `)
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus)
            swal({
                icon: "warning",
                text: "Cannot Edit Todos"
            })
        })
}

function submitedittodo(id) {
    let datearr = $('#edit-date').val().split('/')
    let date = datearr[2] + '-' + datearr[0] + '-' +datearr[1]

    let data = {
        name: $('#edit-name').val(),
        description: $('#edit-desc').val(),
        dueDate: date,
        status: $('#statusSelected').val()
    }
    $.ajax({
            method: "PATCH",
            url: `${baseUrl}/todos/${id}`,
            headers: {
                token: localStorage.getItem('token')
            },
            data: data
        })
        .done(resp => {
            console.log(resp, 'add todo')
            swal({
                icon: "success",
                text: "Success Edit Todo"
            })
            todo()
            $('#edit-name').val(''),
            $('#edit-desc').val(''),
            $('#edit-date').val('')
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus, jqXHR)
            swal({
                icon: "warning",
                title: "Edit Todo Failed",
                text: jqXHR.responseJSON.message
            })
        })
}

function userName(name) {
    swal({
        title: "Hi, " + name
    })
}

function fetchuserName(){
    let user = localStorage.getItem('userName')
    $('#user').empty()
    $('#user').append(`
        <b style="color: white" onclick="userName('${user}')">${user}</b>
    `)
}

function status(status) {
    $.ajax({
            method: "GET",
            url: `${baseUrl}/todos/status/${status}`,
            headers: {
                token: localStorage.getItem('token')
            }
        })
        .done(resp => {
            $('#todolist').empty()
            resp.forEach(resp => {
                let date = resp.dueDate.substr(0, 10).split('-').reverse().join('-')
                $('#todolist').append(`
                <div class="card" style="width: 15rem; height:16rem; margin-right:15px; margin-top:15px; color: white; text-align: center; background-color:#373C42">
                    <div class="card-body">
                    <h5 class="card-title"><b>${resp.name}</b></h5>
                    <h6 class="card-subtitle mb-2">===========</h6>
                    <p class="card-text">Status: ${resp.status}</p>
                    <p class="card-text">Due Date: ${date}</p>
                    <button type="button" class="btn btn-outline-primary" style="margin-bottom:10px;" onclick="detailtodo('${resp.name}','${resp.description}','${resp.status}','${date}')">Detail</button><br>
                    <button type="button" class="btn btn-outline-warning" style="margin-right:5px;" data-target="#edittodomodal" data-toggle="modal" onclick="edittodo('${resp._id}')">Edit</button>
                    <button type="button" class="btn btn-outline-danger" onclick="deletetodo('${resp._id}')">Delete</button>
                    </div>
                </div>
                `)
            });
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus)
            swal({
                icon: "warning",
                text: `Cannot Get ${status} Todos`
            })
        })
}

function project() {
    $.ajax({
            method: "GET",
            url: `${baseUrl}/projects`,
            headers: {
                token: localStorage.getItem('token')
            }
        })
        .done(resp => {
            console.log(resp)
            $('#projectlist').empty()
            resp.forEach(resp => {
                $('#projectlist').append(`
                <div class="card" style="width: 15rem; height:16rem; margin-right:15px; margin-top:15px; color: white; text-align: center; background-color:#373C42">
                    <div class="card-body">
                    <h5 class="card-title"><b>${resp.name}</b></h5>
                    <h6 class="card-subtitle mb-2">===========</h6>
                    <p class="card-text">Owner: ${resp.owner.userName}</p>
                    <button type="button" class="btn btn-outline-primary" style="margin-bottom:10px;" onclick="">Detail</button><br>
                    <button type="button" class="btn btn-outline-warning" style="margin-right:5px;" data-target="#edittodomodal" data-toggle="modal" onclick="edittodo('${resp._id}')">Edit</button>
                    <button type="button" class="btn btn-outline-danger" onclick="deletetodo('${resp._id}')">Delete</button>
                    </div>
                </div>
                `)
            });
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus)
            swal({
                icon: "warning",
                text: "Cannot Get Projects"
            })
        })
}

function newProject(){
    let data = {
        name: $('#project-name').val(),
        description: $('#project-desc').val()
    }
    $.ajax({
            method: "POST",
            url: `${baseUrl}/projects`,
            headers: {
                token: localStorage.getItem('token')
            },
            data: data
        })
        .done(resp => {
            console.log(resp, 'add project')
            swal({
                icon: "success",
                text: "Success Add Project"
            })
            project()
        })
        .fail((jqXHR, textStatus) => {
            console.log(textStatus, jqXHR)
            swal({
                icon: "warning",
                text: "Add Project Failed"
            })
        })
}

$(document).ready(function () {
    if (localStorage.token) {
        fetchuserName()
        todo()
        $('#regisform').hide()
        $('#loginform').hide()
        $('#clickhere').hide()
        $('.nb').show()
        $('#main').show()
        $('#projectmain').hide()
    } else {
        $('#regisform').hide()
        $('#loginform').hide()
        $('#clickhere').show()
        $('.nb').hide()
        $('#main').hide()
    }
})

$('#regisbtn').click(function () {
    event.preventDefault()
    let userName = $('#regisuser').val()
    let email = $('#regisemail').val()
    let password = $('#regispassword').val()

    if (email != '' && password != '' && userName != '') {
        $.ajax({
                method: "POST",
                url: `${baseUrl}/users/signup`,
                data: {
                    userName,
                    email,
                    password
                }
            })
            .done(resp => {
                swal({
                    icon: "success",
                    text: "Success Register, Please Login"
                })
                $('#regisform').hide()
                $('#loginform').show()

                $('#regisuser').val('')
                $('#regisemail').val('')
                $('#regispassword').val('')
                $('#loginemail').val('')
                $('#loginpassword').val('')
            })
            .fail((jqXHR, textStatus) => {
                console.log(textStatus)
                swal({
                    icon: "warning",
                    text: "Email Already Used"
                })
            })
    } else {
        swal({
            text: "Email/Password cannot be empty"
        })
    }
})

$('#loginbtn').click(function () {
    event.preventDefault()
    let email = $('#loginemail').val()
    let password = $('#loginpassword').val()

    if (email != '' && password != '') {
        $.ajax({
                method: "POST",
                url: `${baseUrl}/users/signin`,
                data: {
                    email,
                    password
                }
            })
            .done(resp => {
                $('#loginform').hide()
                $('.nb').show()
                $('#main').show()
                $('#todomain').show()
                $('#projectmain').hide()

                $('#regisuser').val('')
                $('#regisemail').val('')
                $('#regispassword').val('')
                $('#loginemail').val('')
                $('#loginpassword').val('')

                localStorage.setItem("token", resp.token)
                localStorage.setItem("userName", resp.userName)
                todo()
                swal({
                    icon: "success",
                    title: "Success Login!",
                    text: "Welcome, " + localStorage.getItem('userName')
                })
                fetchuserName()
            })
            .fail((jqXHR, textStatus) => {
                console.log(textStatus)
                swal({
                    icon: "warning",
                    text: "Email/Password Wrong"
                })
            })
    } else {
        swal({
            text: "Email/Password cannot be empty"
        })
    }
})

$('#clickhere').click(function () {
    event.preventDefault()
    $('#regisform').hide()
    $('#clickhere').hide()
    $('#loginform').show()
})

$('#formcancelregis').click(function () {
    event.preventDefault()
    $('#regisform').hide()
    $('#clickhere').show()
})

$('#formcancellogin').click(function () {
    event.preventDefault()
    $('#clickhere').show()
    $('#loginform').hide()
})

$('#toRegis').click(function () {
    event.preventDefault()
    $('#regisform').show()
    $('#loginform').hide()
})

$('#toLogin').click(function () {
    event.preventDefault()
    $('#regisform').hide()
    $('#loginform').show()
})

$('#logoutbtn').click(function () {
    event.preventDefault()
    swal({
            title: "Are you sure?",
            text: "We gonna miss you",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                signOut()
                swal("You'r Logout!, We will miss you!", {
                    icon: "success",
                });
            } else {
                swal({
                    icon: "success",
                    text: "Please, Don't do that again!"
                });
            }
        });
})

$('#todo').click(function(){
    projectId = null
    todo()
    $('#projectmain').hide()
    $('#todomain').show()
})

$('#project').click(function(){
    project()
    $('#todomain').hide()
    $('#projectmain').show()
})