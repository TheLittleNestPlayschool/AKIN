/*   test data*/
const frontCards=[
  {
    id:"quick",
    type:"right now",
    kicker:"A small reset",
    title:"I need a minute.",
    copy:"A quiet place to slow things down for a moment.",
    pills:["2 minutes","no pressure"],
    background:"radial-gradient(circle at 30% 18%,#cdd9d3 0,#9eaea7 35%,#687a74 72%,#51615d 100%)"
  },
  {
    id:"clarity",
    type:"think",
    kicker:"A little clarity",
    title:"Help me think this through.",
    copy:"Start with what is actually on your mind right now.",
    pills:["guided","simple"],
    background:"radial-gradient(circle at 70% 10%,#d9cfc7 0,#b9a69a 39%,#806f66 73%,#655850 100%)"
  },
  {
    id:"lift",
    type:"lift",
    kicker:"Something small",
    title:"Give me a little encouragement.",
    copy:"Nothing big. Just something useful for this moment.",
    pills:["gentle","quick"],
    background:"radial-gradient(circle at 25% 15%,#ddd7bd 0,#b7ad84 40%,#817955 72%,#676044 100%)"
  },
  {
    id:"akin",
    type:"personal",
    kicker:"Your personal space",
    title:"My AKIN.",
    copy:"The part that knows you, remembers, and grows with you.",
    pills:["personal","private"],
    background:"radial-gradient(circle at 72% 12%,#d9cedd 0,#b6a7bb 38%,#7b6d82 72%,#5f5365 100%)"
  }
];

const app=document.getElementById("app");
const loginChoice=document.getElementById("loginChoice");
const signInForm=document.getElementById("signInForm");
const createForm=document.getElementById("createForm");
const showSignIn=document.getElementById("showSignIn");
const showCreate=document.getElementById("showCreate");
const frontWorld=document.getElementById("frontWorld");
const personalWorld=document.getElementById("personalWorld");
const breakoutButton=document.getElementById("breakoutButton");
const frontCarousel=document.getElementById("frontCarousel");
const wanderHint=document.getElementById("wanderHint");

let activeIndex=0;
let startX=0;
let deltaX=0;
let dragging=false;
let hasInteracted=false;
let personalOpen=false;

/*   login shell*/
function showLoginForm(form){
  loginChoice.hidden=true;
  signInForm.hidden=form!==signInForm;
  createForm.hidden=form!==createForm;
}

function showLoginChoice(){
  loginChoice.hidden=false;
  signInForm.hidden=true;
  createForm.hidden=true;
}

function enterApp(event){
  event?.preventDefault();

  app.classList.remove("is-login");

  frontWorld.setAttribute(
    "aria-hidden",
    "false"
  );
}

showSignIn.addEventListener(
  "click",
  ()=>showLoginForm(
    signInForm
  )
);

showCreate.addEventListener(
  "click",
  ()=>showLoginForm(
    createForm
  )
);

document
  .querySelectorAll(
    "[data-login-back]"
  )
  .forEach(
    button=>
      button.addEventListener(
        "click",
        showLoginChoice
      )
  );

signInForm.addEventListener(
  "submit",
  enterApp
);

createForm.addEventListener(
  "submit",
  enterApp
);

/*   atmosphere*/
function mixColor(
  a,
  b,
  t
){
  const ah=
    a.replace(
      "#",
      ""
    );

  const bh=
    b.replace(
      "#",
      ""
    );

  const ar=
    parseInt(
      ah.slice(
        0,
        2
      ),
      16
    );

  const ag=
    parseInt(
      ah.slice(
        2,
        4
      ),
      16
    );

  const ab=
    parseInt(
      ah.slice(
        4,
        6
      ),
      16
    );

  const br=
    parseInt(
      bh.slice(
        0,
        2
      ),
      16
    );

  const bg=
    parseInt(
      bh.slice(
        2,
        4
      ),
      16
    );

  const bb=
    parseInt(
      bh.slice(
        4,
        6
      ),
      16
    );

  const r=
    Math.round(
      ar+
      (
        br-ar
      )*
      t
    );

  const g=
    Math.round(
      ag+
      (
        bg-ag
      )*
      t
    );

  const bl=
    Math.round(
      ab+
      (
        bb-ab
      )*
      t
    );

  return`rgb(${r} ${g} ${bl})`;
}

function getPalette(
  hour
){
  const palettes={
    morning:[
      "#fff2d9",
      "#eadfd2",
      "#e2ece5",
      "#faf4ea"
    ],
    afternoon:[
      "#eee5d9",
      "#d9e2d8",
      "#eee2d4",
      "#e8e3df"
    ],
    evening:[
      "#ded9e6",
      "#d4dce4",
      "#e8ded8",
      "#cfd8df"
    ]
  };

  let from;
  let to;
  let t;

  if(
    hour<
    11
  ){
    from=
      palettes.morning;

    to=
      palettes.morning;

    t=0;
  }
  else if(
    hour<
    14
  ){
    from=
      palettes.morning;

    to=
      palettes.afternoon;

    t=
      (
        hour-11
      )/
      3;
  }
  else if(
    hour<
    17
  ){
    from=
      palettes.afternoon;

    to=
      palettes.afternoon;

    t=0;
  }
  else if(
    hour<
    20
  ){
    from=
      palettes.afternoon;

    to=
      palettes.evening;

    t=
      (
        hour-17
      )/
      3;
  }
  else{
    from=
      palettes.evening;

    to=
      palettes.evening;

    t=0;
  }

  return from.map(
    (
      color,
      index
    )=>
      mixColor(
        color,
        to[index],
        t
      )
  );
}

function applyTimeAtmosphere(){
  const now=
    new Date();

  const hour=
    now.getHours()+
    now.getMinutes()/
    60;

  const palette=
    getPalette(
      hour
    );

  palette.forEach(
    (
      color,
      index
    )=>
      document.documentElement.style.setProperty(
        `--time-c${index+1}`,
        color
      )
  );

  let greeting=
    "Good evening.";

  let message=
    "What would help right now?";

  if(
    hour<
    12
  ){
    greeting=
      "Good morning.";

    message=
      "What do you need this morning?";
  }
  else if(
    hour<
    18
  ){
    greeting=
      "Good afternoon.";

    message=
      "What would help right now?";
  }

  document
    .getElementById(
      "timeGreeting"
    )
    .textContent=
      greeting;

  document
    .getElementById(
      "timeMessage"
    )
    .textContent=
      message;
}

/*   front cards*/
function buildFrontCards(){
  frontCards.forEach(
    (
      item,
      index
    )=>{
      const article=
        document.createElement(
          "article"
        );

      article.className=
        "experience";

      article.dataset.index=
        index;

      article.dataset.cardId=
        item.id;

      article.innerHTML=`
        <div class="card">
          <div
            class="card-surface"
            style="--card-bg:${item.background}">
          </div>

          <div class="card-type">
            ${item.type}
          </div>

          <div class="card-content">
            <div class="card-kicker">
              ${item.kicker}
            </div>

            <h2 class="card-title">
              ${item.title}
            </h2>

            <p class="card-copy">
              ${item.copy}
            </p>

            <div class="card-pills">
              ${item.pills
                .map(
                  pill=>
                    `<span class="card-pill">${pill}</span>`
                )
                .join(
                  ""
                )}
            </div>
          </div>
        </div>
      `;

      article.addEventListener(
        "click",
        ()=>{
          if(
            personalOpen
            &&
            Number(
              article.dataset.index
            )===
            activeIndex
          ){
            closePersonal();

            return;
          }

          if(
            Math.abs(
              deltaX
            )<
            8
            &&
            Number(
              article.dataset.index
            )===
            activeIndex
            &&
            item.id===
            "akin"
          ){
            openPersonal();
          }
        }
      );

      frontCarousel.appendChild(
        article
      );
    }
  );

  renderPositions();
}

function renderPositions(){
  const cards=[
    ...frontCarousel.querySelectorAll(
      ".experience"
    )
  ];

  cards.forEach(
    (
      card,
      index
    )=>{
      const offset=
        index-
        activeIndex;

      if(
        offset<
        -2
        ||
        offset>
        2
      ){
        card.style.opacity=
          "0";

        card.style.pointerEvents=
          "none";

        card.style.transform=
          `translate(-50%,-50%) translateX(${offset*64}%) scale(.74)`;

        card.style.filter=
          "blur(9px)";

        card.dataset.pos=
          offset;

        return;
      }

      const x=
        offset*
        73;

      const scale=
        offset===
        0
          ?1
          :.86;

      const rotate=
        offset*
        -2.6;

      const z=
        offset===
        0
          ?0
          :-90;

      const y=
        Math.abs(
          offset
        )*
        10;

      const opacity=
        offset===
        0
          ?1
          :.46;

      card.style.opacity=
        opacity;

      card.style.pointerEvents=
        offset===
        0
          ?"auto"
          :"none";

      card.style.filter=
        offset===
        0
          ?"blur(0)"
          :"blur(1.4px)";

      card.style.transform=
        `translate(-50%,-50%) translate3d(${x}%,${y}px,${z}px) rotate(${rotate}deg) scale(${scale})`;

      card.style.zIndex=
        10-
        Math.abs(
          offset
        );

      card.dataset.pos=
        offset;
    }
  );
}

function move(
  direction
){
  if(
    personalOpen
  ){
    return;
  }

  const next=
    Math.min(
      frontCards.length-
      1,
      Math.max(
        0,
        activeIndex+
        direction
      )
    );

  if(
    next===
    activeIndex
  ){
    return;
  }

  activeIndex=
    next;

  renderPositions();

  hideHint();
}

function hideHint(){
  if(
    hasInteracted
  ){
    return;
  }

  hasInteracted=
    true;

  wanderHint.style.opacity=
    "0";
}

function pointerDown(
  event
){
  if(
    personalOpen
  ){
    return;
  }

  dragging=
    true;

  startX=
    event.clientX??
    event.touches?.[0]?.clientX??
    0;

  deltaX=0;
}

function pointerMove(
  event
){
  if(
    !dragging
  ){
    return;
  }

  const x=
    event.clientX??
    event.touches?.[0]?.clientX??
    0;

  deltaX=
    x-
    startX;
}

function pointerUp(){
  if(
    !dragging
  ){
    return;
  }

  dragging=
    false;

  if(
    deltaX<
    -52
  ){
    move(
      1
    );
  }
  else if(
    deltaX>
    52
  ){
    move(
      -1
    );
  }

  window.setTimeout(
    ()=>{
      deltaX=0;
    },
    0
  );
}

frontCarousel.addEventListener(
  "pointerdown",
  pointerDown
);

window.addEventListener(
  "pointermove",
  pointerMove
);

window.addEventListener(
  "pointerup",
  pointerUp
);

/*   personal layer*/
function openPersonal(){
  personalOpen=
    true;

  hideHint();

  frontWorld.classList.add(
    "is-behind"
  );

  personalWorld.classList.add(
    "is-visible"
  );

  personalWorld.setAttribute(
    "aria-hidden",
    "false"
  );
}

function closePersonal(){
  personalOpen=
    false;

  personalWorld.classList.remove(
    "is-visible"
  );

  personalWorld.setAttribute(
    "aria-hidden",
    "true"
  );

  frontWorld.classList.remove(
    "is-behind"
  );
}

breakoutButton.addEventListener(
  "click",
  closePersonal
);

applyTimeAtmosphere();

buildFrontCards();
