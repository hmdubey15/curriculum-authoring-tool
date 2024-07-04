import React, { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";

import ICONS from "./assets";
import { ACTIONS, DRAGGABLE_ITEM_TYPE } from "./mainPage.constants";
import { getTopicName, getSubjectTitleStyle } from "./mainPage.helpers";

import "./mainPage.css";

const Row = ({ id, data, index, moveItem, dispatch, setErrorText }) => {
  const ref = useRef(null);
  
  const [currentTopicText, setCurrentTopicText] = useState(() => getTopicName(data));

  const [, drop] = useDrop({
    accept: DRAGGABLE_ITEM_TYPE,
    hover: (item) => {
      if (!ref.current || item.index === index) return;
      moveItem(item.index, index, item.id);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DRAGGABLE_ITEM_TYPE,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const deleteThisRow = useCallback((data) => () => {
    dispatch({ type: ACTIONS.DELETE_ROW, payload: data });
  }, [dispatch]);

  const handleIndentClick = useCallback((data) => () => {
    dispatch({ type: ACTIONS.INDENT, payload: { data, setErrorText } });
  }, [dispatch, setErrorText]);

  const handleOutdentClick = useCallback((data) => () => {
    dispatch({ type: ACTIONS.OUTDENT, payload: { data, setErrorText } });
  }, [dispatch, setErrorText]);

  const handleChange = useCallback((event) => {
    setCurrentTopicText(event.target.innerText);
  }, []);

  const handleSetNewText = useCallback(() => {
    dispatch({ type: ACTIONS.EDIT_TEXT, payload: { data, currentTopicText } });
  }, [dispatch, currentTopicText, data]);

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div key={data} className="curriculam-row">
        <img className="img-btn" src={ICONS.DRAG} alt="drag"></img>
        <img className="img-btn" src={ICONS.LEFT_ARROW} onClick={handleOutdentClick(data)} alt="left-arrow"></img>
        <img className="img-btn" src={ICONS.RIGHT_ARROW} onClick={handleIndentClick(data)} alt="right-arrow"></img>
        <img className="img-btn" src={ICONS.DUSTBIN} onClick={deleteThisRow(data)} alt="dustbin"></img>
        <div className="chapter-title-container" style={getSubjectTitleStyle(data)}>
          <div className="chapter-title-icon"></div>
          <div className="chapter-title-text" contentEditable onInput={handleChange} spellCheck="false" onBlur={handleSetNewText} suppressContentEditableWarning={true}>
            {getTopicName(data)}
          </div>
        </div>
      </div>
    </div>
  );
};

Row.propTypes = {
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  moveItem: PropTypes.func.isRequired,
  setErrorText: PropTypes.func.isRequired,
};

export default Row;
