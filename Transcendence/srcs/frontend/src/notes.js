// SIZE
box.style.width = "200px";
box.style.height = "100px";
box.style.minWidth = "100px";
box.style.maxWidth = "500px";

{
	display: "flex"           // flex | inline-flex | block | inline | none
	justifyContent: "flex-start"    // flex-start | flex-end | center | space-between | space-around | space-evenly
	alignItems: "stretch"     // stretch | flex-start | flex-end | center | baseline
}



// POSITION
box.style.position = "absolute";
box.style.top = "50px";
box.style.left = "100px";
box.style.right = "20px";
box.style.bottom = "10px";
box.style.zIndex = "10";

// SPACING
box.style.margin = "10px";
box.style.padding = "20px";
box.style.marginTop = "10px";
box.style.paddingLeft = "5px";

// BACKGROUND & COLORS
box.style.background = "red";
box.style.backgroundColor = "blue";
box.style.color = "white";

// BORDER
box.style.border = "2px solid black";
box.style.borderRadius = "10px";

// TEXT
box.style.fontSize = "20px";
box.style.fontWeight = "bold";
box.style.textAlign = "center";

// DISPLAY & VISIBILITY
box.style.display = "block";
box.style.visibility = "visible";
box.style.opacity = "0.5";

// TRANSFORM
box.style.transform = "translateX(100px)";
box.style.transform = "translate(50px, 20px)";
box.style.transform = "scale(1.5)";
box.style.transform = "rotate(45deg)";
box.style.transform = "translateX(100px) scale(2)";

// ANIMATION & TRANSITION
box.style.transition = "all 0.3s ease";
box.style.animation = "move 2s linear";

// INTERACTION
box.style.cursor = "pointer";
box.style.pointerEvents = "none";
// /////////////////////////////////////////////////////>
// /////////////////////////////////////////////////////>
// CONTENT
el.textContent = "Hello";          // plain text
el.innerHTML = "<b>Hello</b>";     // HTML content
el.innerText = "Hello";            // like textContent but respects line breaks

// ATTRIBUTES
el.id = "myDiv";                   // element ID
el.className = "box highlight";    // full class string
el.classList.add("active");        // add a class
el.classList.remove("hidden");     // remove a class
el.classList.toggle("open");       // toggle a class
el.title = "Tooltip text";         // title attribute
el.value = "42";                   // input value
el.src = "image.png";              // img, video, audio src
el.href = "https://example.com";   // anchor href
el.alt = "alternative text";       // img alt

// DOM STRUCTURE
el.appendChild(child);             // add child
el.append(child1, child2);         // add multiple children
el.prepend(child);                 // add at start
el.remove();                        // remove self
el.replaceWith(newEl);              // replace element
el.cloneNode(true);                 // copy element (deep if true)

// DATA & CUSTOM
el.dataset.id = "123";             // data-id attribute
el.dataset.name = "box1";          // data-name attribute

// EVENTS
el.onclick = () => {};              // direct event assignment
el.onmouseover = () => {};
el.addEventListener("click", () => {});   // preferred
el.removeEventListener("click", handler);

// VISIBILITY & FOCUS
el.hidden = true;                   // hides element
el.focus();                         // focus element
el.blur();                          // remove focus
el.tabIndex = 0;                     // make element focusable

// DIMENSIONS & POSITION (read-only or get)
el.clientWidth;
el.clientHeight;
el.offsetWidth;
el.offsetHeight;
el.offsetTop;
el.offsetLeft;
el.scrollWidth;
el.scrollHeight;
el.scrollTop;
el.scrollLeft;

// OTHER
el.checked = true;                  // checkbox / radio
el.selected = true;                 // option element
el.disabled = true;                 // input/button
el.readOnly = true;                 // input/textarea
el.name = "username";               // input / form element
el.type = "text";                   // input type