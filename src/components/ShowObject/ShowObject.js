import React from "react";
import { connect } from "react-redux";

function ShowObject({ layer }) {
  let strObjects = "";
  for (let key in layer.objects) {
    strObjects += ` ${key}: ${layer.objects[key]}, `;
  }

  const pList = layer.childLayers.map(item => {
    let strChildObjects = "";
    for (let key in item.objects) {
      strChildObjects += ` ${key}: ${item.objects[key]}, `;
    }
    return (
      <p key={Date().now}>
        <b>name:</b> {item.name}
        <br /> <b>id:</b> {item}
        <br /> <b>objects:</b> {strChildObjects}
      </p>
    );
  });

  const divStyle = {
    border: "3px solid #eee",
    margin: "0 0px",
    padding: "10px",
    boxSizing: "border-box",
    wordWrap: "break-word",
    // maxWidth: "350px",
    // minWidth: "150px",
    width: "100%",
    height: "50%",
    overflow: "auto"
  };
  return (
    <div style={divStyle}>
      {" "}
      <p style={{ fontFamily: "Arial" }}>
        <div style={{ textAlign: "center", margin: 0 }}>Intial layer</div>
        <hr style={{ margin: 0 }} />
        <b>name:</b> {layer.name}
        <br />
        <b>id:</b> {layer.id}
        <br />
        <b>objects:</b> {strObjects}
        {layer.childLayers.length !== 0 && (
          <div style={{ textAlign: "center", margin: "15px 0 0 0" }}>
            Child layers
            <hr style={{ margin: 0 }} />
          </div>
        )}
        {pList}
      </p>{" "}
    </div>
  );
}

// const showObj = (layer, p, setP) => {
//   let strObjects = "";
//   for (let key in layer.objects) {
//     strObjects += ` ${key}: ${layer.objects[key]}, `;
//   }
//   const pList = layer.childLayers.map(item => {
//     let strChildObjects = "";
//     for (let key in item.objects) {
//       strChildObjects += ` ${key}: ${item.objects[key]}, `;
//     }
//     return (
//       <p key={Date().now}>
//         <b>name:</b> {item.name}
//         <br /> <b>id:</b> {item.id}
//         <br /> <b>objects:</b> {strChildObjects}
//       </p>
//     );
//   });
//   setP(
//     <p style={{ fontFamily: "Arial" }}>
//       <div style={{ textAlign: "center", margin: 0 }}>Intial layer</div>
//       <hr style={{ margin: 0 }} />
//       <b>name:</b> {layer.name}
//       <br />
//       <b>id:</b> {layer.id}
//       <br />
//       <b>objects:</b> {strObjects}
//       {layer.childLayers.length !== 0 && (
//         <div style={{ textAlign: "center", margin: "15px 0 0 0" }}>
//           Child layers
//           <hr style={{ margin: 0 }} />
//         </div>
//       )}
//       {pList}
//     </p>
//   );
// };

export default connect(state => ({
  layer: state.layer
}))(ShowObject);
