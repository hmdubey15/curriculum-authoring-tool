// Can refer README.md file for some reference to logic used

import React, { useReducer, useState, useRef, useEffect, useCallback, useMemo } from "react";

import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import { ACTIONS } from "./mainPage.constants";
import { downloadJSONfile, getListOfRows, loadStateFromJSON } from "./mainPage.helpers";
import reducer from "./mainPage.reducer";
import ICONS from "./assets";
import Row from "./Row";

import "./mainPage.css";

const MainPage = () => {
  const [state, dispatch] = useReducer(reducer, {});

  const [newTopicName, setNewTopicName] = useState(null);
  const [errorText, setErrorText] = useState(null);
  const [rowId, setRowId] = useState(16);

  const tableRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isMountedRef.current) tableRef.current.scrollTop = tableRef.current.scrollHeight;
    isMountedRef.current = true;
  }, [rowId]);

  useEffect(() => {
    let timeoutId;
    if (errorText)
      timeoutId = setTimeout(() => {
        setErrorText(null);
      }, 3000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [errorText]);

  const arrayOfData = useMemo(() => getListOfRows({ ...state }), [state]);

  const setNewTopic = useCallback(
    (data) => (event) => {
      setNewTopicName(data !== undefined ? data : event.target.value);
    },
    []
  );

  const saveNewTopic = useCallback(() => {
    dispatch({ type: ACTIONS.ADD_NEW_ROW, payload: { newTopicName, rowId } });
    setNewTopicName(null);
    setRowId((id) => id + 1);
  }, [newTopicName, rowId]);

  const moveItem = useCallback(
    (prevIndex, hoverIndex, data) => {
      const payload = { sourceData: data, destinationData: arrayOfData[hoverIndex], bottomToTop: prevIndex > hoverIndex };
      if (data !== arrayOfData[hoverIndex]) dispatch({ type: ACTIONS.DRAG, payload });
    },
    [arrayOfData]
  );

  const downloadJSON = useCallback(() => {
    downloadJSONfile(state);
  }, [state]);

  const loadJSON = useCallback((event) => {
    isMountedRef.current = false;
    loadStateFromJSON(event.target.files[0], setErrorText, setRowId, dispatch);
  }, []);

  return (
    <div className="main-page">
      <h1 className="subject-heading">Mathematics</h1>
      <div className="table-title">
        <h3>Actions</h3>
        <h3>Standard</h3>
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="curriculam-table" ref={tableRef}>
          {arrayOfData.map((data, index) => (
            <Row key={data} id={data} data={data} index={index} moveItem={moveItem} dispatch={dispatch} setErrorText={setErrorText} />
          ))}
        </div>
      </DndProvider>

      {newTopicName !== null ? (
        <div className="input-field-container">
          <input type="text" onChange={setNewTopic()} className="input-field" placeholder="Enter topic name"></input>
          <button onClick={saveNewTopic} className="save-btn">
            Save
          </button>
          <button onClick={setNewTopic(null)} className="cancel-btn">
            Cancel
          </button>
        </div>
      ) : (
        <div role="button" className="add-a-sec-btn" onClick={setNewTopic("")}>
          <img src={ICONS.PLUS_CIRCLE} alt="plus"></img>Add a section
        </div>
      )}

      <div className="json-controllers-container">
        <label for="file-load" className="load-json">
          Load JSON
        </label>
        <input type="file" onChange={loadJSON} accept=".json" id="file-load" hidden />
        <button onClick={downloadJSON} className="download-json">
          Download JSON
        </button>
      </div>

      {errorText && (
        <div className="error-dialog">
          <img src={ICONS.ERROR} alt="error"></img>
          {errorText}
        </div>
      )}
    </div>
  );
};

export default MainPage;
