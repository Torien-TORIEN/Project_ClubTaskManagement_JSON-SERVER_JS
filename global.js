
//URL
const userUrl="http://localhost:3535/users"
const eventUrl="http://localhost:3535/events"
const taskUrl="http://localhost:3535/tasks"
const loginUrl="./template/login.html"
const registerUrl="./template/signUp.html"
const indexUrl="../index.html"

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

class Event{
    constructor(id, title, description){
        this.id=id;
        this.title=title;
        this.description=description
    }

}

class Task{
    constructor(taskname,duration,status,des,id_event){
        this.id=taskname.toLowerCase().replace(/\s+/g, '').replace(/[\',"]+/,'_');
        this.title=taskname;
        this.duration=duration;
        this.status=status;
        this.description=des;
        this.id_event=id_event
    }
}


// Get user by email 
async function getUser(email){
    const url=userUrl+`?email=${email}`
    const response=await fetch(url)
    const data=await response.json()
    let result=JSON.stringify(data)
    
    return data;
}

function get(id){
    return document.getElementById(id).value
}

// Sign in 
function signIn(){
    let email=document.getElementById("email").value
    let pasword=document.getElementById("pwd").value
    if(email==null || pasword==null || pasword.length<3){
        document.getElementById("errorlogin").innerHTML="Tous les champs sont obligatoires"
    }else{
        document.getElementById("errorlogin").innerHTML=""

        getUser(email)
        .then(data=>{ 
            let user=data
            if(user.length==0){
                document.getElementById("errorlogin").innerHTML=`Aucun utilisateur avec email :" ${email}" n'est trouvé !`
            }else if(user.length==1){
                let {id,username,email,role,password}=user[0]
                current_user=new User(username,email,role,password)
                current_user.show()
                console.log("user_current :"+current_user.password+ " + saisie :"+pasword)
                if(current_user.password==pasword){
                    localStorage.setItem("current_user",JSON.stringify(current_user))
                    console.log(" login  username :"+localStorage.getItem("current_user"))
                    document.location.href=indexUrl
                }else{
                    document.getElementById("errorlogin").innerHTML="mot de passe  incorrect !"
                }
            }else{
                document.getElementById("errorlogin").innerHTML="Un problème est survenu ! "
            }
        })
        

    }
}

function createUser(role){
    let username=get("username")
    let email =get("email")
    let pwd=get("pwd")
    let cpwd=get("cpwd")

    if(username==""||email==""||pwd==""||cpwd==""){
        document.getElementById("errorRegister").innerHTML=" Tous les champs sont obligatoires !"
    }else if(!validateEmail(email)){
        document.getElementById("errorRegister").innerHTML=" Email incorrect!"
    }else if(pwd.length<3){
        document.getElementById("errorRegister").innerHTML=" Le mot de passe doit etre au minimuim 3 caractères!"
    }else if(pwd !=cpwd){
        document.getElementById("errorRegister").innerHTML=" les deux mots de passes ne sont pas les memes !"
    }else{
        let newUser = new User(username,email,role,pwd)
        document.getElementById("errorRegister").innerHTML=""
        fetch(userUrl,{
            method:"POST",
            headers:{'content-type':"application/json"},
            body:JSON.stringify({
                "id":newUser.id,
                "username":newUser.username,
                "email":newUser.email,
                "role":newUser.role,
                "password":newUser.password
            })
        })
        .then(res=>{
            alert("Compte a été créé avec succès !")
            console.log(res.json())
            location="../index.html"
        })
        .catch(res=>{
            document.getElementById("errorRegister").innerHTML="Cet email existe déjà !"
        })

    }
}

function logOut(){
    localStorage.removeItem("current_user")
    restrict()
}


function restrict(){
    let current_user=localStorage.getItem("current_user")
    console.log("current_user :",current_user)
    if(current_user==null){
      location="./login.html"
    }
}

const validateEmail = (email) => {
    emailRegex=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return emailRegex.test(email);
  };

 