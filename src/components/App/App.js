import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import SetForm from "../SetForm/SetForm";
import ShowObject from "../ShowObject/ShowObject";
import ShowFormObject from "../ShowFormObject/ShowFormObject";
import { connect } from "react-redux";
import "./style.css";

function App({
  onGetLayersArr,
  layer,
  onUpdateLayer,
  childLayer,
  onUpdateChildLayer
}) {
  const [isFetchCalled, setIsFetchCalled] = useState(false); // Состояние уже загруженных слоев, если нет то загрузить если да то не надо, инче появлялся постоянный рендер слоев
  const url = "http://localhost:3000/layers";
  if (!isFetchCalled) {
    fetch(url)
      .then(response => response.json())
      .then(layersArr => {
        onGetLayersArr(layersArr);
        return layersArr;
      })
      .then(layersArr => {
        getRequredLayer();
        async function getRequredLayer() {
          let response = await fetch(
            `http://localhost:3000/layers/configs/${layersArr[0].id}`
          );
          let requiredLayer = await response.json();
          onUpdateLayer(requiredLayer);
        }
      })
      .catch(err => alert("Ошибка загрузки слоев " + err));
    setIsFetchCalled(true); // ф-ия остановки постоянного запроса данных
  }

  const [isShowedProperties, setIsShowedProperties] = useState(false);
  const [areShowedOutputAreas, setAreShowedOutputAreas] = useState(false);
  const [workingWithChildLayer, setWorkingWithChildLayer] = useState(false);
  const [requiredChildLayer, setRequiredChildLayer] = useState({});
  const [addChildLayerInputValue, setAddChildLayerInputValue] = useState("");
  const [addChildLayerInputStyle, setAddChildLayerInputStyle] = useState({});
  const [shouldAddChildLayer, setShouldAddChildLayer] = useState(false);
  const [childLayerIndex, setChildLayerIndex] = useState(0);

  const creatingChildLayer = event => {
    if (event.target.classList.contains("btnInitialLayer")) {
      setWorkingWithChildLayer(false);
      // console.log(
      //   "from creating Layer---workingwith childLayer: ",
      //   workingWithChildLayer
      // );
    } else if (event.target.classList.contains("btnChildLayer")) {
      setWorkingWithChildLayer(true);
      // console.log(
      //   "from creating Layer---workingwith childLayer: ",
      //   workingWithChildLayer
      // );
    }
    return;
  };

  //Нажатие на селект выбора слоя
  const handleLayerSelect = event => {
    try {
      getRequredLayer();
      async function getRequredLayer() {
        let response = await fetch(
          `http://localhost:3000/layers/configs/${
            event.target.options[event.target.value].dataset.id
          }`
        );
        let requiredLayer = await response.json();
        onUpdateLayer(requiredLayer);

        setAreShowedOutputAreas(true);
      }
    } catch (err) {
      alert("Произошла ошибка: ", err);
    }
  };
  const handleAddLayerInput = event => {
    setIsShowedProperties(true);
    onUpdateLayer({
      name: event.target.value,
      id: "userId",
      childLayers: [],
      objects: {}
    });
    return;
  };
  const handleChildLayerSelect = event => {
    // fetch(
    //   `http://localhost:3000/layers/configs/${event.target.options[event.target.value].dataset.id}`
    // )
    //   .then(response => response.json())
    //   .then(childLayer =>
    //     setRequiredChildLayer(Object.assign({}, childLayer))
    //   )
    //   .catch(err => alert("Произошла ошибка: " + err));
    // return;

    // Временно, пока не настроен сервер
    const index = event.target.value;
    setRequiredChildLayer(Object.assign(layer.childLayers[index]));
    setChildLayerIndex(event.target.value);
    alert(childLayerIndex);
    // console.log("from childLayerSelect---", requiredChildLayer);
    return;
  };
  const handleChildLayerInput = event => {
    setAddChildLayerInputValue(event.target.value);
    setRequiredChildLayer({
      name: event.target.value,
      id: "userChildLayer",
      objects: {}
    });

    onUpdateChildLayer({
      name: event.target.value,
      id: "userChildLayerId",
      childLayers: [],
      objects: {}
    });
    return;
  };
  const [objectsBuffer, setObjectsBuffer] = useState(
    workingWithChildLayer
      ? Object.assign({}, requiredChildLayer.objects)
      : Object.assign({}, layer.objects)
  );

  const collectObjects = event => {
    let name = event.target.dataset.property;
    let buffer = {};
    if (event.target.type === "checkbox") {
      buffer[name] = event.target.checked;
    } else {
      buffer[name] = event.target.value;
    }

    if (workingWithChildLayer) {
      //переделать
      setRequiredChildLayer(
        Object.assign(requiredChildLayer, { objects: objectsBuffer })
      );
      onUpdateChildLayer(
        Object.assign(childLayer, {
          objects: { ...childLayer.objects, ...buffer }
        })
      );
    } else {
      onUpdateLayer(
        Object.assign(layer, { objects: { ...layer.objects, ...buffer } })
      );
    }
    setAreShowedOutputAreas(true);
    // console.log("childLayer---", childLayer);
  };

  //Ф-ия вывода свойств набранного объекта справа в рамке

  const btnSaveChildLayer = event => {
    if (event.target.tagName === "BUTTON") event.preventDefault();

    //Проверка на пустой childLayer
    if (Object.keys(requiredChildLayer.objects).length === 0) return;
    checkSameChildLayer();
    onUpdateLayer(
      Object.assign(layer, {
        childLayers: [...layer.childLayers, requiredChildLayer]
      })
    );
    setWorkingWithChildLayer(false);
    document.querySelector(".btnChildLayer").classList.remove("active");
    document.querySelector(".btnInitialLayer").classList.add("active");

    //ф-ия проверки одинаковых childLayers
    function checkSameChildLayer() {
      const childLayersArr = layer.childLayers;
      let index = "initial";
      for (let i = 0; i < childLayersArr.length; i++) {
        if (childLayersArr[i].name === requiredChildLayer.name) {
          index = i;
          break;
        }
      }
      if (index !== "initial") {
        childLayersArr.splice(index, 1);
        onUpdateLayer(Object.assign(layer, { childLayers: childLayersArr }));
      } else return;
    }

    // console.log("from btnSaveChildLayer - layer--- ", layer);
  };

  const [isHiddenAddLayerContainer, setIsHiddenAddLayerContainer] = useState(
    true
  );
  const [isHiddenSelectLayer, setIsHiddenSelectLayer] = useState(false);
  async function btnSendClick(event) {
    event.preventDefault();
    let sendMethod, url;
    if (layer.id === "userId") {
      sendMethod = "POST";
      url = "http://localhost:3000/layers/configs";
    } else {
      //надо добавить разрешение на запрос изменения данных на сервере
      sendMethod = "PUT";
      url = `http://localhost:3000/layers/configs/${layer.id}`;
    }

    try {
      await fetch(url, {
        method: sendMethod,
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(layer)
      });
      alert("Успешно");
      setIsFetchCalled(false); // нужно отрендерить новый список доступных слоев
    } catch (e) {
      alert(`Ошибка ${e}`);
    } finally {
      setIsHiddenAddLayerContainer(true);
      setIsHiddenSelectLayer(false);
      setAreShowedOutputAreas(false);
      setIsShowedProperties(false);
    }
  }

  const showFillProperty = event => {
    //Открытие доп. свойств при нажатии на fill
    if (event.target.tagName === "INPUT") {
      event.target.parentElement.parentElement.nextElementSibling.hidden = !event
        .target.parentElement.parentElement.nextElementSibling.hidden;
    }
  };

  return (
    <div className="appDiv">
      <SetForm
        // saveChanges={saveChanges}
        btnSendClick={btnSendClick}
        showFillProperty={showFillProperty}
        setIsShowedProperties={setIsShowedProperties}
        isShowedProperties={isShowedProperties}
        areShowedOutputAreas={areShowedOutputAreas}
        setAreShowedOutputAreas={setAreShowedOutputAreas}
        isHiddenAddLayerContainer={isHiddenAddLayerContainer}
        isHiddenSelectLayer={isHiddenSelectLayer}
        setIsHiddenAddLayerContainer={setIsHiddenAddLayerContainer}
        setIsHiddenSelectLayer={setIsHiddenSelectLayer}
        creatingChildLayer={creatingChildLayer}
        btnSaveChildLayer={btnSaveChildLayer}
        addChildLayerInputValue={addChildLayerInputValue}
        setAddChildLayerInputValue={setAddChildLayerInputValue}
        addChildLayerInputStyle={addChildLayerInputStyle}
        shouldAddChildLayer={shouldAddChildLayer}
        setShouldAddChildLayer={setShouldAddChildLayer}
        workingWithChildLayer={workingWithChildLayer}
        setWorkingWithChildLayer={setWorkingWithChildLayer}
        handleLayerSelect={handleLayerSelect}
        handleAddLayerInput={handleAddLayerInput}
        handleChildLayerSelect={handleChildLayerSelect}
        handleChildLayerInput={handleChildLayerInput}
        collectObjects={collectObjects}
      />

      <div className="outputAreas">
        {areShowedOutputAreas && <ShowObject />}
        {areShowedOutputAreas && <ShowFormObject layerStyle={layer.objects} />}
      </div>
    </div>
  );
}

export default connect(
  state => ({
    layersArr: state.layers,
    layer: state.layer,
    childLayersBuffer1: state.childLayersBuffer,
    childLayer: state.childLayer
  }),
  dispatch => ({
    onGetLayersArr(layersArr) {
      dispatch({ type: "GET_LAYERS", payload: layersArr });
    },
    onUpdateLayer(layer) {
      dispatch({ type: "UPDATE_LAYER", payload: layer });
    },
    onUpdateChildLayer(childLayer) {
      dispatch({ type: "UPDATE_CHILD_LAYER", payload: childLayer });
    }
  })
)(App);

// //Проверка на пустое поле addChildLayerInput
// if (
//   addChildLayerInputValue === "" &&
//   workingWithChildLayer &&
//   shouldAddChildLayer
// ) {
//   setAddChildLayerInputStyle({ outline: "1px solid red" });
//   return;
// } else {
//   setAddChildLayerInputStyle({ outline: "none" });
// }
