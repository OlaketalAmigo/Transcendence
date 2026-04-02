import { Popup } from "./popup.js";
import { colorizeText, updateElement } from "./tools.js";


/* /////////////////////////////////////////// */



/* /////////////////////////////////////////// */
// 2️⃣ Add click handler
async function tryLogin() {
    const login = prompt("Enter your 42 login:"); // Ask for a login

    if (!login) return;

    try {
        // Call your backend route
        const res = await fetch(`/api/intra/profile/${login}`);

        if (!res.ok) {
            new Popup('Please, who do you think we are?\nWe already know all about you.\nNow enter your correct login and nobody gets hurt');
            const errorData = await res.json();
            return null;
        }

        const data = await res.json();
        console.log("Profile data:", data);
        return data;
    } catch (err) {
        console.error("Fetch failed:", err);
        return null;
    }
}

/* /////////////////////////////////////////// */
export class Wiskas {
    constructor(parent = document.body) {
        this.parent = parent;
        this.obj = updateElement({
            parent: parent,
            classList: ['wiskas']
        })

        this.json_login = '';
        this.index_chaberu = 0;
        this.iniChat();
    }

    chaberu() {
        let num = Math.min(this.index_chaberu, this.discussions.length - 1);
        let text = this.discussions[num];
        new Popup(text, this.obj);
        this.index_chaberu++;
    }

    iniChat() {
        this.discussions = ['Well hi there...',
            'Please refrain from touching\n the yellow button without\n beeing logged in',
            'We are going to take actions\n if you continue..', 
            'Actions already taken\n you are only making it worse'];
    }

    async login() {
        let answer = await tryLogin();
        if (!answer) return;
        this.json_login = answer;

        let dataUser = {
            firstName: this.json_login.usual_first_name ?? this.json_login.first_name,
            lastName: this.json_login.last_name,
            photo: this.json_login.image.link,
            month: this.json_login.pool_month,
            year: this.json_login.pool_year,
            projects: this.json_login.projects_users.filter(project => project.status === "in_progress").map(project => project.project.name),
            perfect: this.json_login.projects_users.filter(project => project.final_mark === 125).map(project => project.project.name),

        };
        this.discussions = [
            `Welcome ${dataUser.firstName} ${dataUser.lastName}.`,
            `We heard quite a lot about the piscine of ${dataUser.month} ${dataUser.year}...\nIt's suprising to see you here`,
            `How is your ${dataUser.projects[Math.floor(Math.random() * dataUser.projects.length)]} coming along?`,
            `Perfect score for ${dataUser.perfect[Math.floor(Math.random() * dataUser.perfect.length)]}, impressive.. Should you really spend so much time in front of a screen?`,
            `Shouldn't you be working on your ${dataUser.projects[Math.floor(Math.random() * dataUser.projects.length)]}?`,
            `Quite an ugly human...\n but then again, you arent a cat`
        ];
    }
}


/* /////////////////////////////////////////// */
let el = document.getElementById('helloText');
let img = document.createElement('img');
img.src = '../assets/wiskas-the-third.jpg';
el.append(img);
/* /////////////////////////////////////////// */
colorizeText();
/* /////////////////////////////////////////// */
// 1️⃣ Create a button dynamically
const app = document.getElementById('login');


let cat = new Wiskas;

let buttonLogin = document.getElementById('login-button');
Object.assign(buttonLogin.style, {
    position: 'fixed', // make sure it's fixed
    top: '0',
    left: '0',
    right: 'auto' // remove the right: 0 if it comes from CSS
});
buttonLogin.addEventListener('click', () => cat.login());
img.addEventListener('click', () => { cat.chaberu() })

