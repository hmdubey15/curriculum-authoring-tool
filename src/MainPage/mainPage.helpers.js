import { ACTIONS } from "./mainPage.constants";

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

const getTopicId = (str) => {
  let lastIndex = str.lastIndexOf("_");
  let secondLastIndex = str.lastIndexOf("_", lastIndex - 1);
  return str.substring(secondLastIndex + 1, lastIndex);
};

const getStateKey = (str) => {
  const lastIndex = str.lastIndexOf("_");
  if (lastIndex !== -1) return str.substring(0, lastIndex);
  return str;
};

const getNestingLevel = (str) => {
  const lastIndex = str.lastIndexOf("_");
  if (lastIndex !== -1) return str.substring(lastIndex + 1);
  return str;
};

export const getTopicName = (str) => {
  const lastUnderscoreIndex = str.lastIndexOf("_");
  const secondLastUnderscoreIndex = str.lastIndexOf("_", lastUnderscoreIndex - 1);
  if (secondLastUnderscoreIndex !== -1) return str.substring(0, secondLastUnderscoreIndex);
  return str;
};

export const getSubjectTitleStyle = (data) => {
  const nestingLevel = parseInt(getNestingLevel(data));
  let _style;
  if (nestingLevel === 1) _style = { fontWeight: "bold", color: "#38CDD2", fontSize: "16px" };
  else if (nestingLevel === 2) _style = { fontWeight: "bold", fontSize: "14px" };
  else _style = { fontSize: "12px" };
  return {
    ..._style,
    marginLeft: `calc(${nestingLevel}rem + 4rem)`,
  };
};

export const getListOfRows = (currentState) => {
  const arr = [];
  const addToList = (obj, nestingLevel = 1) => {
    for (const key in obj) {
      arr.push(`${key}_${nestingLevel}`);
      if (!isEmptyObject(obj[key])) addToList(obj[key], nestingLevel + 1);
    }
  };
  addToList(currentState);
  return arr;
};

export const deleteRow = (currentState, data) => {
  const keyToDelete = getStateKey(data);
  const deletion = (obj) => {
    for (const key in obj) {
      if (key === keyToDelete) delete obj[keyToDelete];
      else if (!isEmptyObject(obj[key])) deletion(obj[key], keyToDelete);
    }
  };
  deletion(currentState);
  return currentState;
};

export const appendNewRow = (currentState, { newTopicName, rowId }) => {
  currentState[`${newTopicName}_${rowId}`] = {};
  return currentState;
};

export const indentData = (currentState, { data, setErrorText }) => {
  const keyToIndent = getStateKey(data);
  const indentUtil = (obj) => {
    let upperSibling = null;
    for (const key in obj) {
      if (key === keyToIndent) {
        if (upperSibling) {
          obj[upperSibling][key] = obj[key];
          delete obj[key];
        } else setErrorText("Indent Failed: Max indent limit reached");
        return;
      } else indentUtil(obj[key]);
      upperSibling = key;
    }
  };
  indentUtil(currentState);
  return currentState;
};

export const outdentData = (currentState, { data, setErrorText }) => {
  const keyToOutdent = getStateKey(data);
  const outdentUtil = (obj, grandParent = null, parent_key) => {
    for (const key in obj) {
      if (key === keyToOutdent) {
        if (grandParent) {
          const grandParentCopy = { ...grandParent };
          Object.keys(grandParent).forEach((key1) => delete grandParent[key1]);
          for (let key1 in grandParentCopy) {
            grandParent[key1] = grandParentCopy[key1];
            if (key1 === parent_key) grandParent[key] = obj[key];
          }
          delete obj[key];
        } else setErrorText("Outdent failed: Max outdent limit reached");
        return;
      } else outdentUtil(obj[key], obj, key);
    }
  };
  outdentUtil(currentState);
  return currentState;
};

export const changePosition = (currentState, { sourceData, destinationData, bottomToTop }) => {
  const sourceDataNestingLevel = parseInt(getNestingLevel(sourceData));
  const destinationDataNestingLevel = parseInt(getNestingLevel(destinationData));
  const sourceDataKey = getStateKey(sourceData);
  const destinationDataKey = getStateKey(destinationData);

  let sourceParent = null,
    destinationParent = null;
  const setSourceAndDestParents = (obj) => {
    if (sourceParent && destinationParent) return;
    for (let key in obj) {
      if (key === sourceDataKey) sourceParent = obj;
      if (key === destinationDataKey) destinationParent = obj;
      setSourceAndDestParents(obj[key]);
    }
  };
  setSourceAndDestParents(currentState);

  if (sourceDataNestingLevel - destinationDataNestingLevel === 1) {
    destinationParent[destinationDataKey] = { [sourceDataKey]: sourceParent[sourceDataKey], ...destinationParent[destinationDataKey] };
    delete sourceParent[sourceDataKey];
  } else if (sourceDataNestingLevel === destinationDataNestingLevel) {
    const destinationParentCopy = { ...destinationParent };
    const sourceObjCopy = sourceParent[sourceDataKey];
    delete sourceParent[sourceDataKey];
    for (let key in destinationParent) delete destinationParent[key];
    if (bottomToTop) {
      for (let key in destinationParentCopy) {
        if (key === destinationDataKey) destinationParent[sourceDataKey] = sourceObjCopy;
        destinationParent[key] = destinationParentCopy[key];
      }
    } else {
      const destinationParentReverse = {};
      const reverseKeys = Object.keys(destinationParentCopy).reverse();
      reverseKeys.forEach((reverseKey) => {
        if (reverseKey === destinationDataKey) destinationParentReverse[sourceDataKey] = sourceObjCopy;
        destinationParentReverse[reverseKey] = destinationParentCopy[reverseKey];
      });
      Object.keys(destinationParentReverse)
        .reverse()
        .forEach((key) => {
          destinationParent[key] = destinationParentReverse[key];
        });
    }
  }

  return currentState;
};

export const editText = (currentState, { data, currentTopicText }) => {
  const keyBeingEdited = getStateKey(data);
  let foundKey = false;
  const editTextUtil = (obj) => {
    if (foundKey) return;
    const newObj = {};
    for (let key in obj) {
      if (key === keyBeingEdited) {
        newObj[`${currentTopicText}_${getTopicId(data)}`] = obj[key];
        foundKey = true;
      } else newObj[key] = obj[key];
      editTextUtil(obj[key]);
    }
    if (foundKey) {
      for (let key1 in obj) delete obj[key1];
      for (let key1 in newObj) obj[key1] = newObj[key1];
    }
  };
  editTextUtil(currentState);
  return currentState;
};

export const downloadJSONfile = (state) => {
  const jsonData = JSON.stringify(state);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Curriculam Table";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const loadStateFromJSON = (file, setErrorText, setRowId, dispatch) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const jsonObj = JSON.parse(e.target.result);
      let rowId = 0;
      const loadStateUtil = (obj) => {
        const newState = {};
        for (let key in obj) {
          const topicName = getTopicName(`${key}_`);
          rowId = rowId + 1;
          newState[`${topicName}_${rowId}`] = loadStateUtil(obj[key]);
        }
        return newState;
      };
      const finalState = loadStateUtil(jsonObj);
      setRowId(rowId);
      dispatch({ type: ACTIONS.LOAD_STATE_FROM_JSON, payload: finalState });
      return finalState;
    } catch (error) {
      setErrorText("Error parsing JSON");
      console.error(error);
    }
  };
  if (file) {
    if (file.type === "application/json") {
      reader.readAsText(file);
    } else {
      setErrorText("Invalid file type. Please select a JSON file.");
    }
  }
};
