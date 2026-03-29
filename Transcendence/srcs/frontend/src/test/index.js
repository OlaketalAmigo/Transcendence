// import { LoginSidebar } from "./loginSidebar.js";
import { Sidebar } from "./sidebar.js";
import { updateElement } from "./tools.js";

let b = updateElement({
    classList: ['container2'],
    additionalStyles: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
});
new Sidebar(b);
// new LoginSidebar();


// new Sidebar();
