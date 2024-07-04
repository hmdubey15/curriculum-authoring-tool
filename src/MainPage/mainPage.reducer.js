import { ACTIONS } from "./mainPage.constants";
import { appendNewRow, changePosition, deleteRow, editText, indentData, outdentData } from "./mainPage.helpers";

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_NEW_ROW: {
      return appendNewRow({...state}, action.payload);
    }
    case ACTIONS.DELETE_ROW: {
      return deleteRow({ ...state }, action.payload);
    }
    case ACTIONS.INDENT: {
      return indentData({ ...state }, action.payload);
    }
    case ACTIONS.OUTDENT: {
      return outdentData({ ...state }, action.payload);
    }
    case ACTIONS.DRAG: {
      return changePosition({ ...state }, action.payload);
    }
    case ACTIONS.EDIT_TEXT: {
      return editText({ ...state }, action.payload)
    }
    case ACTIONS.LOAD_STATE_FROM_JSON: {
      return action.payload;
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
};

export default reducer;
