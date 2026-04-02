*This project has been created as part of the 42 curriculum by agallon, gprunet, yantoine and tfauve-p*

**DESCRIPTION**

For starters, ft_transcendence is a wonderful project based on building a web-application running from Docker containers where the goal is, for the first time to do whatever we want, yet still we need to follow multiples criteria based on a number of points to grind to set the project as finished.

For such a project our group thought about the "CATETRIBBL.IO". We chose to make a web application featuring multiples games such as Tetris one of the very first game ever developed and Skkribl.io the amazing drawing game !

But beware ! A mysterious noble cat named Wiskas The Third is gone ... It is said that he's been lurking around trapping 42's students into infinite conversation known as "tunnel". If you see him please report to us as soon as possible !

**INSTRUCTIONS**

Like every 42 project you will need to git clone it into a valid repository, then add our functional .env file at the root of the repository. After all that, make use of the "make" command and watch our fabulous containers building themselves ! Look for https://localhost:8443/ once it's built, remember that you need to login in order to play on our web app !

Outside of 42 environment you will obviously need Docker and Make installed.

**RESOURCES**

- https://www.geeksforgeeks.org
- https://developer.mozilla.org/fr/docs/Web/JavaScript
- https://www.w3schools.com/js/
- https://www.tigerdata.com/learn/postgres-cheat-sheet
- https://www.programiz.com/css/button-styling
- https://developer.mozilla.org/fr/docs/Web/CSS
- https://chatgpt.com/
- https://www.gimp.org/tutorials/

AI was mostly used to ask questions and deepen understanding, it was also used to generate multiple samples of what we could do front-end wise.

**FEATURES:**

- Login
- Avatar
- Global Chat
- Skribbl.io + Spectator mode
- Tetris + Duels
- Wiskas the Third

Use of the framework Express for the back-end because its compatible with jsonwebtoken(JWT) and contains solid and well tested features.

**DEPENDENCIES**

- "express": "^4.18.2",
- "pg": "^8.11.3",
- "bcrypt": "^5.1.0",
- "jsonwebtoken": "^9.0.2",
- "dotenv": "^17.2.3",
- "socket.io": "^4.6.1",
- "cors": "^2.8.5",
- "passport": "0.7.0",
- "passport-github2": "0.1.12",
- "express-session": "1.18.0",
- "multer": "^1.4.5-lts.1",
- "file-type": "^19.0.0"

**TEAM INFORMATION**

Tfauve-p : The project manager, is in lead of organizing all the meeting with the team which changed over time, including then some recruitment. There was some adjustments to make over our vision of the project while coding it on GitHub.

Yantoine : The project owner, is in lead of both games, Tetris and Skkribl.io, made core decisions on features about these and got the work completed. His communication skills were very important due to the front-end / back-end relationship needed in order to achieve this glorious project.

Gprunet : The technical lead, is in charge of the back-end, made some strong decisions on the architectures of the project in terms of technology used. Created the entire database and most of the foundation of this project such as the builder files.

Agallon : Developer in the front-end action, he joined the team after the project was done but managed to innovate and brought to life the marvelous Wiskas the Third. Furthermore he also cared about the integrity of the web application and greatly improved the user experience through logical decisions.

**PROJECT MANAGEMENT**

The task's sharing was based on our own advance of the 42 cursus, meaning that Gprunet and Yantoine started coding the app sooner than Tfauve-p and Agallon.

Gprunet: Back-end + spectator mode
Yantoine: Github auth, games and Front/Back sockets
Tfauve-p: Front-end Designer
Agallon: Adjustements on Front-end and some new features.


**TECHNICAL STACK**

Front-end: JavaScript, HTML, CSS, NGINX
Back-end: JavaScript, Express, JWT, multer, etc...
Database: PostgreSQL because it uses a permissibe open-source licence and is feature-rich and powerful for the scale of our project

Since python doesn't have many front-end framework we opted to use JavaScript for both front and back.
After learning about JWT and learning that Express had a great synergy with it the choice was natural.


**DATABASES SCHEMA**

![Database Schema required ... ](./postgresql-architecture.jpg)


**FEATURES LIST**

- 2 Games
- One talking Cat
- Friends chat
- 

**MODULES**

Total : 23pts ( 14pts for 100% 19pts for 125% )

- WEB

Minor : Use a back end framework

Major : Implement real-time features

Major : Allow users to interact with others

Major : A public API to interact with the database

Minor : A complete notification system for all creation, update and deletion account

- ACCESSIBILITY

Minor : Support for additional browsers

- USER MANAGEMENT

Major : Standard user management and authentication

Minor : Game statistics and match history ???

Minor : Implement remote authentication

- GAMING AND USER EXPERIENCE

Major : Implement a complete web-based game where users can play against each other

Major : Remote players, Enable two players on separate computers to play the same game

Major : Multiplayer game

Major : Add another game with user history and matchmaking

Minor : Advanced chat features ???? 

Minor : Game customization options

Minor : Spectator mode for games


