const userUrl="http://localhost:3535/users"
const eventUrl="http://localhost:3535/events"
const taskUrl="http://localhost:3535/tasks"
const taskAttUrl="http://localhost:3535/tasks_att"
const loginUrl="./template/login.html"
const registerUrl="./template/signUp.html"
const current_user=JSON.parse(localStorage.getItem("current_user"))

// Classes
class User{
    constructor(username,email,role,password){
        this.id=email;
        this.username=username;
        this.email=email
        this.role=role
        this.password=password
    }
    show(){
        console.log( "user :"+ this.username+" | "+this.email+" | "+this.role+" pwd :"+this.password)
    }
}

class Eventt{
    constructor(id, title, description){
        this.id=id;
        this.title=title;
        this.description=description
    }

}

class Task{
    constructor(taskname,duration,status,des,id_event){
        this.id=taskname.toLowerCase().replace(/\s+/g, '').replace(/[\',"]+/,'_');
        this.taskname=taskname;
        this.duration=duration;
        this.status=status;
        this.description=des;
        this.id_event=id_event
    }
}


//import {User,Fvent,Task} from "./global.js"
function get(id){
    return document.getElementById(id).value
}



// Charger les evenements et les taches  
//Create td 
function create_td_event(i,data){
    let td=document.createElement('tr')
            if(current_user.role=="Admin"){
                td.innerHTML=`<td>${i}</td>
                <td>${data.title}</td>
                <td>${data.description}</td>
                <td>
                    <button class="btn btn-info" onclick="updateEvent('${data.id}')" data-toggle="modal" data-target="#event_modal">modifier</button>
                    <button class="btn btn-danger" onclick="deleteEvent('${data.id}')">supprimer</button>
                </td>`;
            }else{
                td.innerHTML=`<td>${i}</td>
            <td>${data.title}</td>
            <td>${data.description}</td>`
            }
    return td
}


function show_event(){
    document.getElementById("tbody_event").innerHTML=""
    let tbody_event=document.getElementById("tbody_event")
    fetch(eventUrl+"?_sort=title")
    .then(res=>res.json())
    .then(json=>{
        // json.map(data=>{
        //     tbody_event.append(create_td_event(data))
            
        // })
        for(let i=0 ;i<json.length;i++){
            tbody_event.append(create_td_event(i+1,json[i]))
        }
    })
}


function create_td_task(data,event){
    let td=document.createElement('tr')
    if(current_user.role=="Membre"){
        td.innerHTML=`
        <td><a href="#btn_attribuer"  onclick="show_task_one('${data.id}')">${data.taskname}</a></td>
        <td>${data.status}</td>
        <td>${data.duration} heures</td>
        <td>${event}</td>`;
    }else{
        td.innerHTML=`
        <td>${data.taskname}</td>
        <td>${data.status}</td>
        <td>${data.duration} heures</td>
        <td>${event}</td>
        <td>
            <a href="#btn_attribuer" class="btn btn-success" onclick="show_task_one('${data.id}')">show</a>
            <button class="btn btn-info" data-toggle="modal" data-target="#task_modal_update" onclick="updateTask('${data.id}')">Modifier</button>
            <button class="btn btn-danger" onclick="deleteTask('${data.id}')">Supprimer</button>
        </td>
        `;
    }
    
    return td
}

function show_task(){
    document.getElementById("tbody_task").innerHTML=""
    let tbody_event=document.getElementById("tbody_task")
    if(current_user.role=="Membre"){
        fetch(taskAttUrl+`?id_user=${current_user.id}`)
        .then(res=>res.json())
        .then(json=>{
            if(json.length==0){
                document.getElementById("show_task").innerHTML=`<div class="container" style="text-align:center;background-color:aquamarine;border-style:double;border-radius:5px;margin-top: 20px;">
                <h3> Vous n'avez aucune tache à faire !</h3>
              </div>`
            }else{
                //console.log(json)
                json.map(data=>{
                    fetch(taskUrl+`/${data.id_task}`)
                    .then(rep=>rep.json())
                    .then(task=>{
                        //console.log("task",task)
                        fetch(eventUrl+`/${task.id_event}`)
                        .then(ans=>ans.json())
                        .then(event=>{
                            tbody_event.append(create_td_task(task,event.title))
                        })
                    })
                })
            }
        })

    }else{
        fetch(taskUrl+"?_sort=id")
        .then(res=>res.json())
        .then(json=>{
            json.map(data=>{
                fetch(eventUrl+`/${data.id_event}`)
                .then(res=>res.json())
                .then(json=>{
                    tbody_event.append(create_td_task(data,json.title))
                })
                .catch(error=>{alert("erreur est survenue au moment de charger les taches !");console.log(error)})
                
            })
        })
    }
}

function create_td_task_att(id,tache,membre,etat){
    let td=document.createElement('tr')
    if(current_user.role=="Membre")
    {
        td.innerHTML=`<td>${tache}</td>
            <td>${membre}</td>
            <td>${etat}</td>`;
    }else{
        td.innerHTML=`<td>${tache}</td>
            <td>${membre}</td>
            <td>${etat}</td>
            <td><button class="btn btn-danger" onclick="deleteTaskAtt('${id}')">supprimer</button></td>`;
    }
    
    return td
}


//---------------------- User ------------------------------------------//

function UpdateProfile(){
    let username=get("username_up")
    let email=get("email_up")
    let Apwd=get("Apwd_up")
    let Npwd=get("Npwd_up")

    if(username==""||email==""||Apwd==""||Npwd==""){
        document.getElementById("errorUser").innerHTML="Tous les champs sont obligatoires"
    }else if(Apwd!=current_user.password){
        document.getElementById("errorUser").innerHTML="L'acien mot de passe incorrect !"
    }else if(Npwd.length<3){
        document.getElementById("errorUser").innerHTML="Le nouveau mot de pass doit etre au minimuim 3 caratères !"
    }else{
        document.getElementById("errorUser").innerHTML=""
        fetch(userUrl+`/${current_user.id}`,{
            method:"PATCH",
            headers:{'content-type':"application/json"},
            body:JSON.stringify({
                "email":email,
                "username":username,
                "password":Npwd
            })
        })
        .then(res=>res.json())
        .then(json=>{
            user=new User(username,email,current_user.role,Npwd)
            localStorage.setItem("current_user",JSON.stringify(user))
            console.log(" login  username :"+localStorage.getItem("current_user"))
            location="./index.html"
            alert("Votre profil a été mis à jour !")
            console.log(json)
        })
        .catch(err=>{
            alert("erreur est survenue !")
            console.log(err)
        })
    }

}

function fillUserForm(){
    document.getElementById("username_up").value=current_user.username
    document.getElementById("email_up").value=current_user.email
}


function deleteUser(id){
    let url=userUrl+`/${id}`
    if (confirm("Vous voulez vraiment supprimer cet utilisateur !")){
        fetch(url,{
            method :"DELETE",
            headers :{'content-type':"application/json"}
        })
        .then(res=>{
            console.log(res.json)
        })
        .catch(res=>{
            console.log(res)
            alert("Un problème est survenu lors de la suppression !")
        })
    }
}


//------------------------ Event --------------------------------------//
function resetModal(){
    document.getElementById("event_modal").innerHTML=`<div class="modal-dialog">
    <div class="modal-content">

      <!-- Modal Header -->
      <div class="modal-header">
        <h4 class="modal-title">Ajouter un évenement</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      
      <!-- Modal body -->
      <div class="modal-body" >
        <form>
            <div class="form-group" id="title_event_form">
              <label for="title">Titre</label>
              <input type="text" class="form-control" id="title" name="title_event_form" >
            </div>
           
            <div class="form-group">
              <label for="des">description</label>
              <textarea class="form-control" id="des" rows="3"></textarea>
            </div>
            <div class="form-group">
                <i><h6 id="errorEvent" class="alert-danger" style="text-align:center"></h6></i>
            </div>
        </form>
      </div>
      
      <!-- Modal footer -->
      <div class="modal-footer" id="footer_event_modal">
        <button class="btn btn-primary" onclick="addEvent()">Ajouter</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
      </div>
      
    </div>
  </div>`
}

function addEvent(){
    document.getElementById("errorEvent").innerHTML=""
    let title=get("title")
    let des =get ("des")
    let id=title.toLowerCase().replace(/\s+/g, '').replace(/[\',"]+/,'_')
    if(title==""|| des==""){
        document.getElementById("errorEvent").innerHTML="Tous les champs sont obligatoires "
    }else{
        let newEvent=new Eventt(id,title,des)
        fetch(eventUrl,{
            method:"POST",
            headers:{'content-type':"application/json"},
            body:JSON.stringify({
                "id":newEvent.id,
                "title":newEvent.title,
                "description":newEvent.description
            })
        })
        .then(res=>res.json())
        .then(json=>{
            document.getElementById("errorEvent").innerHTML=""
            console.log(json)
            location="./index.html"
            alert("Ajout avec succès !")
        })
        .catch(err=>{
            console.error(err.json)
            document.getElementById("errorEvent").innerHTML="Un Problème est survenu ! Le titre doit etre unique "
        })
    }
}

function updateEvent(id){
    fetch(eventUrl+`/${id}`)
    .then(res=>res.json())
    .then(json=>{
        
        document.getElementById("des").innerHTML=json.description
        document.getElementById("title").value=json.title
        document.getElementById("footer_event_modal").innerHTML=`<button class="btn btn-primary" onclick="SaveUpdate('${json.id}')">Enregistrer</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>`
        console.log(json.title)
    })
}
function SaveUpdate(id){
    let title=get("title")
    let des =get("des")
    if(title==""||des==""){
        document.getElementById("errorEvent").innerHTML="Tous les chanmps sont obligatoires"
    }else{
        fetch(eventUrl+`/${id}`,{
            method:"PATCH",
            headers:{'content-type':"application/json"},
            body:JSON.stringify({
                "title":title,
                "description":des
            })
        })
        .then(res=>res.json())
        .then(json=>{
            document.getElementById("errorEvent").innerHTML=""
            alert("Modification avec succes ")
            show_event()
            location="./index.html#show_event"
        })
        .catch(error=>{
            document.getElementById("errorEvent").innerHTML="Un problème est survenu lors de la modification"
        })
    }
}

function deleteEvent(id){
    fetch(taskUrl+`?id_event=${id}`)
    .then(res=>res.json())
    .then(json=>{
        console.log(json)
        if(json.length==0){
            if(confirm("Vous voulez supprimez cet evenement ? ")){
                fetch(eventUrl+`/${id}`,{
                    method:"DELETE",
                    headers:{'content-type':"application/json"}
                })
                .then(res=>res.json())
                .then(json=>{location.href="./index.html";alert("Suppression avec succès !");console.log(json);})
                .catch(error=>{alert("Un problème est survenu !");console.log(error)})
            }
        }else{
            alert("Impossible de Suprimer cet évènement car il y' a "+json.length+" taches liées à cet évènement !" )
        }
    })
}

//------------------------- Task -------------------------------------//
function loadEventSelect(){
    fetch(eventUrl)
    .then(res=>res.json())
    .then(json=>{
        let option=""
        json.map(data=>{
            option=option+`<option value="${data.id}">${data.title}</option>`
        })
        document.getElementById("id_event_select").innerHTML=option
    })
    .catch(err=>{alert("erreur au niveau de select event pour les taches ");console.log(err)})
}

function loadEventSelectUpdate(){
    fetch(eventUrl)
    .then(res=>res.json())
    .then(json=>{
        let option=""
        json.map(data=>{
            option=option+`<option value="${data.id}">${data.title}</option>`
        })
        document.getElementById("id_event_select_update").innerHTML=option
    })
    .catch(err=>{alert("erreur au niveau de select event pour les taches update ");console.log(err)})
}


function createTask(){
    let taskname=get("taskname")
    let duration=get("duration")
    let description=get("desTask")
    let id_event=get("id_event_select")
    let status;
    let etat = document.querySelector( 'input[name="status"]:checked');   
    if(etat != null) {   
        status=  etat.value  
    }
    if(taskname==""||duration==""||description==""||id_event==""){
        document.getElementById("errorTask").innerHTML="Tous les champs sont obligatoires"
    }else{
        newTask=new Task (taskname,duration,status,description,id_event)
        fetch(taskUrl,{
            method:"POST",
            headers:{'content-type':"application/json"},
            body:JSON.stringify({
                "id":newTask.id,
                "taskname":newTask.taskname,
                "duration":newTask.duration,
                "status":newTask.status,
                "id_event":newTask.id_event,
                "description":newTask.description
                
            })

        })
        .then(res=>res.json())
        .then(json=>{
            document.getElementById("errorTask").innerHTML=""
            console.log(json)
            location="./index.html"
        })
        .catch(err=>{
            document.getElementById("errorTask").innerHTML="Ce task existe déjà !"
            console.log(err)
        })
    }
}

function updateTask(id){
    loadEventSelectUpdate()
    fetch(taskUrl+`/${id}`)
    .then(res=>res.json())
    .then(task=>{
        let button=`<button class="btn btn-primary" onclick="saveUpdateTask('${task.id}')">Enregistrer</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>`
        document.getElementById("taskname_update").value=task.taskname
        document.getElementById("duration_update").value=task.duration
        document.getElementById("desTask_update").innerHTML=task.description
        document.getElementById("footer_event_modal_update").innerHTML=button
        
    })

    
}

function saveUpdateTask(id){
    document.getElementById("errorTaskUpdate").innerHTML=""
    let taskname=get("taskname_update")
    let duration=get("duration_update")
    let id_event=get("id_event_select_update")
    let des =get("desTask_update")

    if(taskname==""||duration==""||des==""){
        document.getElementById("errorTaskUpdate").innerHTML="Tous les champs son obligatoires !"
    }else{
        document.getElementById("errorTaskUpdate").innerHTML=""
        if(confirm("Vous etes sur de l'évènement choisi ! ")){
            fetch(taskUrl+`/${id}`,{
                method:"PATCH",
                headers:{'content-type':"application/json"},
                body:JSON.stringify({
                    "taskname":taskname,
                    "duration":duration,
                    "id_event":id_event,
                    "description":des
                })
            })
            .then(res=>res.json())
            .then(json=>{
                alert("Modification avec succès !")
                console.log(json)
                location="./index.html"
            })
            .catch(err=>{
                document.getElementById("errorTaskUpdate").innerHTML="Erreur est survenue lors de la modification !"
                console.log(err.json())})
        }
    }
}

function deleteTask(id){
    if(confirm("Vous voulez supprimer ce task ?")){
        fetch(taskAttUrl+`?id_task=${id}`)
        .then(rep=>rep.json())
        .then(task=>{
            if(task.length==0){
                fetch(taskUrl+`/${id}`,{
                    method:"DELETE",
                    headers:{'content-type':"application/json"}
                })
                .then(res=>{
                    console.log(res.json())
                    location="./index.html"
                    alert("Suppression avec succes !")
                })
                .catch(error=>{
                    console.error(error.json())
                    alert("Erreur est survenu lors de la suppression !")
                })
            }else{
                alert(`Suppression impossible car cette tache est déjà attribuée à ${task.length} membres !`)
            }
        })
        
    }
}

function show_task_one(id){
    fetch(taskUrl+`/${id}`)
    .then(res=>res.json())
    .then(json=>{
        fetch(eventUrl+`/${json.id_event}`)
        .then(ans=>ans.json())
        .then(event=>{
            console.log(json)
        let html=`<div class="container" style="background-color:rgb(210, 248, 227);border-radius:10px;margin-top:15px">
        <h3 class="text-center" style="color: #4CAF50;text-shadow: 2px 2px 4px #000000;border-bottom-style:dotted">${json.taskname}</h3>
        <hr style="background-color: red;">
        <label for=""><u>Evènement </u> : ${event.title}</label>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
        <label for=""><u>Durée</u> : ${json.duration} heures</label>
        <hr style="background-color: red;">`

        if(json.status=="finie"){
            html=html+`<div class="progress-bar" style="width:100%" ><p><strong>status</strong> :<i style="background-color :green;">${json.status}</i> </p></div>
            </div>
            <div class="md-form mb-4 pink-textarea active-pink-textarea-2">
                <i class="fas fa-angle-double-right prefix"></i>
                <textarea id="form23" class="md-textarea form-control" rows="3" readonly>${json.description}</textarea>
            </div>
            <button class="btn btn-danger" onclick="resetStatus('${json.id}')">Remettre</button>`

        }else if(json.status=="en cours"){
            html=html+`<div class="progress-bar" style="width:50%"><p><strong>status</strong> :<i class="btn-success" style="color :red;">${json.status}</i> </p></div>
            </div>
            <div class="md-form mb-4 pink-textarea active-pink-textarea-2">
                <i class="fas fa-angle-double-right prefix"></i>
                <textarea id="form23" class="md-textarea form-control" rows="3" readonly>${json.description}</textarea>
            </div>
            <button class="btn btn-danger" onclick="resetStatus('${json.id}')">Remettre</button>
            <button class="btn btn-success" onclick="finishStatus('${json.id}')">Finir</button>`

        }else{
            html=html+`<div class="progress-bar" style="width:5%"></div>
            <p class="text-center"><strong>status</strong> :<i class="btn-danger" style="color :;">${json.status}</i></p>
            </div>
            <div class="md-form mb-4 pink-textarea active-pink-textarea-2">
                <i class="fas fa-angle-double-right prefix"></i>
                <textarea id="form23" class="md-textarea form-control" rows="3" readonly>${json.description}</textarea>
            </div>
            <button class="btn btn-primary" onclick="startStatus('${json.id}')">Commencer</button>
            <button class="btn btn-success" onclick="finishStatus('${json.id}')">Finir</button>`

        }
        if(current_user.role=="Admin"){
            html=html+`<button class="btn btn-primary" id="btn_attribuer" onclick="attributeTask('${json.id}')" data-toggle="modal" data-target="#attribuer_modal">  Attribuer  </button>`
        }
        html=html+'</div>'
        show("task_one_show")
        document.getElementById("task_one_show").innerHTML=html
        })
        
    })
    
}

// change status
function startStatus(id){
    fetch(taskUrl+`/${id}`,{
        method:"PATCH",
        headers:{'content-type':"application/json"},
        body:JSON.stringify({"status":"en cours"})
    })
    .then(res=>res.json())
    .then(result=>{
        //alert("Le status est en cours maintenant  !")
        show_task() 
        show_task_one(id)
        show_tasks_att()
        location="index.html#task_one_show"
        console.log(result)
    })
}

function finishStatus(id){
    fetch(taskUrl+`/${id}`,{
        method:"PATCH",
        headers:{'content-type':"application/json"},
        body:JSON.stringify({"status":"finie"})
    })
    .then(res=>res.json())
    .then(result=>{
        //alert("Cette est marquée finie maintenant !")
        show_task() 
        show_task_one(id)
        show_tasks_att()
        location="index.html#task_one_show"
        console.log(result)
    })
}

function resetStatus(id){
    fetch(taskUrl+`/${id}`,{
        method:"PATCH",
        headers:{'content-type':"application/json"},
        body:JSON.stringify({"status":"vièrge"})
    })
    .then(res=>res.json())
    .then(result=>{
        //alert("Le status de cette tache est rémis à zero  !") 
        show_task() 
        show_task_one(id)
        show_tasks_att()
        location="index.html#task_one_show"
        console.log(result)
    })
}



//--------------------------- Attribuer une tache --------------------------------//
function loadUser(){
    fetch(userUrl)
    .then(res=>res.json())
    .then(json=>{
        let option=""
        json.map(user=>{
            option=option+`<option value="${user.id}">${user.username}</option>`
        })
        document.getElementById("membres").innerHTML=option
    })
}

function attributeTask(id){
    let bouton=`<button class="btn btn-primary" onclick="saveAttribute('${id}')">Confirmer</button>
    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>`
    document.getElementById("footer_att").innerHTML=bouton
    loadUser()
    fetch(taskUrl+`/${id}`)
    .then(res=>res.json())
    .then(task=>{
        document.getElementById("taskname_att").value=task.taskname;
    })
}

function saveAttribute(id_task){
    let user_email=get("membres")
    let id=id_task+"_"+user_email
    document.getElementById("errorAtt").innerHTML=""
    if(confirm("Vous etes sur d'attribuer cette tache à ce membre ?")){
        fetch("http://localhost:3535/tasks_att",{
            method:"POST",
            headers:{"content-type":"application/json"},
            body:JSON.stringify({
                "id":id,
                "id_task":id_task,
                "id_user":user_email
            })
        })
        .then(res=>res.json())
        .then(json=>{
            console.log(json)
            alert("Attribution avec succès !")
            location="./index.html"
        })
        .catch(err=>{
            document.getElementById("errorAtt").innerHTML="Erreur ! Cette tache est déjà affectée à ce membre !"
        })
    }
}

function show_tasks_att(){
    document.getElementById("tbody_att").innerHTML=""
    let table_att=document.getElementById("tbody_att")
    fetch("http://localhost:3535/tasks_att")
    .then(res=>res.json())
    .then(task_att=>{
        task_att.map(task=>{
            //console.log(task.id_task)
            fetch(taskUrl+`/${task.id_task}`)
            .then(rep=>rep.json())
            .then(tache=>{
                //console.log(tache.taskname,tache.id)
                fetch(userUrl+`/${task.id_user}`)
                .then(ans=>ans.json())
                .then(user=>{
                    //console.log(tache.taskname)
                    table_att.append(create_td_task_att(task.id,tache.taskname,user.username,tache.status))
                })
            })
        })
    })
}

function deleteTaskAtt(id){
    fetch(`http://localhost:3535/tasks_att/${id}`,{
        method:"DELETE",
        headers:{'content-type':"application/json"},
    })
    .then(res=>res.json())
    .then(json=>{
        alert("suppresion avec succès !")
        console.log(json)
        show_tasks_att()
        
    })
    .catch(err=>{
        alert("Erreur de la suppresion de cette tache attribuée !")
        console.log(err)
    })
}



//--------------------------------XXXXXXX-----------------------------------------//
function logOut(){
    localStorage.removeItem("current_user")
    restrict()
}

function restrict(){
    let current_user=localStorage.getItem("current_user")
    console.log("current_user :",current_user)
    if(current_user==null){
      location=loginUrl
    }
}

// show and hide HTML element 
function show(id){
    document.getElementById(id).style.display="block";
}
function hide(id){
    document.getElementById(id).style.display="none";
}

function gestionEvenement(){
    hide("show_task")
    show("show_event")
    hide("show_task_att")
    hide("task_one_show")
}
function gestionTache(){
    show("show_task")
    hide("show_event")
    hide("task_one_show")
    hide("show_task_att")
}
function voirTachesAttribués(){
    hide("show_task")
    hide("show_event")
    show("show_task_att")
    hide("task_one_show")
}

// ---------------------------------- Entrée -------------------------------------
hide("show_event") //Masquer les evenements
hide("show_task_att") 
show_task() //Charger les taches dans la base dans  la table des taches 
show_event() //Charger les évenements  dans la base dans  la table des événments 
show_tasks_att()
fillUserForm()


//if member is connected

if(current_user.role=="Membre"){
    document.getElementById("gestion_event").innerHTML="Les évènements"
    document.getElementById("gestion_task").innerHTML="Mes taches "
    document.getElementById("title_gestion_event").innerHTML="Les Evènements"
    document.getElementById("title_gestion_task").innerHTML="Mes Taches"
    hide("ajout_btn")
    hide("action_task_att")
    hide("action_event")
    hide("action_task")
    hide("ajout_btn_task")
    hide("taches_attribuées")
    hide("add_member")
}
