const fs = require("fs");
let html = fs.readFileSync("/home/user/dashboard/decrypted_dashboard.html", "utf8");
const orig = html;

function patch(desc, oldStr, newStr) {
  if (!html.includes(oldStr)) {
    console.error(`MISSING [${desc}]:\n${oldStr.slice(0,150)}`);
    process.exit(1);
  }
  const count = html.split(oldStr).length - 1;
  if (count > 1) {
    console.error(`AMBIGUOUS [${desc}]: found ${count} times`);
    process.exit(1);
  }
  html = html.replace(oldStr, newStr);
  console.log(`OK: ${desc}`);
}

// ── Change 1a: Revenue editing – init `a` state from localStorage ─────────
patch(
  "Init a state from localStorage",
  `[a,u]=(0,On.useState)(Nre)`,
  `[a,u]=(0,On.useState)(()=>{try{const v=localStorage.getItem("dash_rev_all");return v?{...Nre,...JSON.parse(v)}:Nre}catch{return Nre}})`
);

// ── Change 1b: Add revEd state after fcastEd state ────────────────────────
patch(
  "Add revEd state",
  `[fcastEd,setFcastEd]=(0,On.useState)(false),`,
  `[fcastEd,setFcastEd]=(0,On.useState)(false),[revEd,setRevEd]=(0,On.useState)(false),`
);

// ── Change 1c: Replace Executive Summary section header with flex row that
//    includes an Edit Revenue button ─────────────────────────────────────
patch(
  "Add Edit Revenue button in exec summary header",
  `(0,N.jsx)(gc,{icon:GR,title:"Executive Summary"})`,
  `(0,N.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:0},children:[(0,N.jsx)(gc,{icon:GR,title:"Executive Summary"}),(0,N.jsxs)("button",{onClick:()=>setRevEd(v=>!v),style:{background:"none",border:"1px solid "+z.border,borderRadius:8,padding:"6px 14px",color:revEd?z.indigo:z.muted,cursor:"pointer",fontSize:12,fontWeight:600,marginBottom:20},children:[revEd?"Done Editing Revenue":"Edit Revenue"]})]})`
);

// ── Change 1d: Insert revenue edit panel before Financial Performance ──────
patch(
  "Add revenue edit panel before Financial Performance",
  `(0,N.jsx)(gc,{icon:pb,title:"Financial Performance",color:z.emerald})`,
  `revEd&&(0,N.jsxs)("div",{style:{...cr,marginBottom:24,padding:20},children:[(0,N.jsx)("div",{style:{fontSize:12,fontWeight:700,color:z.muted,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"},children:"Edit Revenue Data"}),(0,N.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16},children:[["Jan Goal","janGoal",a.janGoal],["Jan Final","janFinal",a.janFinal],["Feb Goal","febGoal",a.febGoal],["Feb Committed","febCommitted",a.febCommitted],["3-Month Target","threeMonthTarget",a.threeMonthTarget],["3-Month Gap","threeMonthGap",a.threeMonthGap]].map(function(fd){var label=fd[0],key=fd[1],val=fd[2];return (0,N.jsxs)("label",{style:{fontSize:11,color:z.muted,display:"flex",flexDirection:"column",gap:4},children:[label,(0,N.jsx)("input",{defaultValue:val!=null?String(val):"",onBlur:function(e){var n=parseFloat(e.target.value.replace(/[$,]/g,""));if(!isNaN(n)){var next=Object.assign({},a,{[key]:n});u(next);try{localStorage.setItem("dash_rev_all",JSON.stringify(next))}catch{}}},style:{background:z.bg,border:"1px solid "+z.border,borderRadius:6,padding:"6px 10px",color:z.text,fontSize:13,outline:"none"}})]},"rev_"+key);})}),(0,N.jsx)("div",{style:{fontSize:12,fontWeight:700,color:z.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"},children:"Flighting"}),(0,N.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12},children:a.flighting.map(function(row,ri){return (0,N.jsxs)("div",{style:{background:z.raised,borderRadius:6,padding:10},children:[(0,N.jsx)("div",{style:{fontSize:11,fontWeight:700,color:z.muted,marginBottom:6},children:row.month}),(0,N.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[["signed","Signed"],["unsigned","Unsigned"]].map(function(fa){var field=fa[0],lbl=fa[1];return (0,N.jsxs)("label",{style:{fontSize:11,color:z.muted,display:"flex",flexDirection:"column",gap:2},children:[lbl,(0,N.jsx)("input",{defaultValue:row[field]!=null?String(row[field]):"",onBlur:function(e){var n=parseFloat(e.target.value.replace(/[$,]/g,""));if(!isNaN(n)){var nextF=a.flighting.map(function(r2,i){return i===ri?Object.assign({},r2,{[field]:n}):r2;});var next=Object.assign({},a,{flighting:nextF});u(next);try{localStorage.setItem("dash_rev_all",JSON.stringify(next))}catch{}}},style:{background:z.bg,border:"1px solid "+z.border,borderRadius:4,padding:"3px 6px",color:z.text,fontSize:12}})]},"fl_"+field);})]})]},ri);})}),(0,N.jsxs)("button",{onClick:function(){localStorage.removeItem("dash_rev_all");u(Nre);},style:{background:"none",border:"1px solid "+z.border,borderRadius:6,padding:"6px 14px",color:z.muted,cursor:"pointer",fontSize:12},children:"Reset to Defaults"})]}),
(0,N.jsx)(gc,{icon:pb,title:"Financial Performance",color:z.emerald})`
);

// ── Change 2: Fix burnParser to read Q71 directly (O[70][16]) ─────────────
patch(
  "burnParser read Q71 directly",
  `const totRow=rows.find(row=>/^(grand )?total$/i.test(String(row[0]).trim()))||rows[rows.length-1];if(totRow){const col=pctIdx>-1?pctIdx:16;const pv=parseFloat(String(totRow[col]||"").replace(/[$,%]/g,"").replace(/,/g,""));if(!isNaN(pv))Z(pv);}`,
  `if(O.length>70){const pv=parseFloat(String(O[70][16]||"").replace(/[$,%]/g,"").replace(/,/g,""));if(!isNaN(pv))Z(pv);}`
);

// ── Change 3: Column P (index 15) for overUnder in w() parser ────────────
patch(
  "Use column P (index 15) for overUnder",
  `overUnder:ne(ie),pct:ne(ee)`,
  `overUnder:parseFloat((le[15]||"").replace(/[$,%]/g,""))||0,pct:ne(ee)`
);

// ── Change 4a: Make FP grid single column ─────────────────────────────────
// The FP grid is uniquely identified by the display:flex/space-between inside first child
patch(
  "Make FP grid single column",
  `gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32},children:[(0,N.jsxs)("div",{style:cr,children:[(0,N.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}`,
  `gridTemplateColumns:"1fr",gap:16,marginBottom:32},children:[(0,N.jsxs)("div",{style:cr,children:[(0,N.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}`
);

// ── Change 4b: Remove bar chart div from FP grid (position-based) ─────────
{
  // Use position-based extraction since bracket counting is complex
  const startMarker = `,(0,N.jsxs)("div",{style:cr,children:[(0,N.jsx)("div",{style:{fontSize:13,fontWeight:600,color:z.muted,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em"},children:"Top 8 Clients by Active Fee Volume"})`;
  const endMarker = `,(0,N.jsxs)("div",{style:{...cr,padding:24,marginBottom:32}`;
  const startPos = html.indexOf(startMarker);
  const endPos = html.indexOf(endMarker, startPos);
  if (startPos < 0 || endPos < 0) {
    console.error(`MISSING [Remove bar chart div]: startPos=${startPos} endPos=${endPos}`);
    process.exit(1);
  }
  const barSection = html.slice(startPos, endPos);
  html = html.slice(0, startPos) + html.slice(endPos);
  console.log(`OK: Remove bar chart div (removed ${barSection.length} chars)`);
}

// ── Change 5: Full client name in $ Top Clients card (remove nowrap/ellipsis) ─
patch(
  "Show full client name in top clients card",
  `style:{flex:1,fontSize:13,fontWeight:600,color:z.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:name`,
  `style:{flex:1,fontSize:13,fontWeight:600,color:z.text},children:name`
);

// ── Change 6: Agency Utilization Trend – same 6 weeks as heatmap ──────────
patch(
  "Trend chart uses _wStart slice",
  `(0,N.jsxs)(fb,{data:H,children:`,
  `(0,N.jsxs)(fb,{data:H.slice(_wStart,_wStart+6),children:`
);

// ── Change 7: Project Health – show top 10 + add Status column ───────────
patch(
  "Project health show top 10",
  `q=[...S].sort((O,_)=>_.overUnder-O.overUnder).slice(0,8)`,
  `q=[...S].sort((O,_)=>_.overUnder-O.overUnder).slice(0,10)`
);

patch(
  "Project health add Status column header",
  `["Client","Project","PM","Fee","Budget","Burn","Remaining","Over/(Under)","% Var"].map(O=>(0,N.jsx)("th"`,
  `["Client","Project","Status","PM","Fee","Budget","Burn","Remaining","Over/(Under)","% Var"].map(O=>(0,N.jsx)("th"`
);

patch(
  "Project health add Status cell",
  `(0,N.jsx)("td",{style:{padding:"7px 6px",color:z.muted,fontSize:11},children:O.pm?.split(" ").slice(-1)[0]})`,
  `(0,N.jsxs)("td",{style:{padding:"7px 6px"},children:[(0,N.jsx)("span",{style:{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,background:O.status==="Active"?"rgba(52,211,153,0.15)":O.status==="At Risk"?"rgba(251,191,36,0.15)":"rgba(248,113,113,0.15)",color:O.status==="Active"?z.emerald:O.status==="At Risk"?z.amber:z.red},children:O.status||"Active"})]}),(0,N.jsx)("td",{style:{padding:"7px 6px",color:z.muted,fontSize:11},children:O.pm?.split(" ").slice(-1)[0]})`
);

// ── Write output ──────────────────────────────────────────────────────────
if (html === orig) {
  console.error("No changes were made!");
  process.exit(1);
}
fs.writeFileSync("/home/user/dashboard/decrypted_dashboard.html", html);
console.log("\nDone. All patches applied.");
