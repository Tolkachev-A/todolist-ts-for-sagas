import {setAppStatusAC} from "../../app/app-reducer";
import {call, put, takeEvery} from "redux-saga/effects";
import {ResponseType, todolistsAPI, TodolistType} from "../../api/todolists-api";
import {
  addTodolistAC,
  changeTodolistEntityStatusAC,
  changeTodolistTitleAC,
  removeTodolistAC,
  setTodolistsAC
} from "./todolists-reducer";
import {AxiosResponse} from "axios";
import {handleServerNetworkError} from "../../utils/error-utils";

export function* fetchTodolistsWorker() {
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<TodolistType[]> = yield call(todolistsAPI.getTodolists)
    yield put(setTodolistsAC(res.data))
    yield put(setAppStatusAC("succeeded"))
  } catch (e) {
    yield handleServerNetworkError(e);
  }
}

export function* removeTodolistWorker( action: ReturnType<typeof removeTodolistWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    yield put(changeTodolistEntityStatusAC(action.todolistId, "loading"))
    yield call(todolistsAPI.deleteTodolist, action.todolistId)
    yield put(removeTodolistAC(action.todolistId))
    yield put(setAppStatusAC("succeeded"))
  } catch (e) {
    yield handleServerNetworkError(e);
  }
}

export function* addTodolistWorker( action: ReturnType<typeof addTodolistWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<ResponseType<{ item: TodolistType }>> = yield call(todolistsAPI.createTodolist, action.title)
    if (res.data.resultCode === 0) {
      yield put(addTodolistAC(res.data.data.item))
      yield put(setAppStatusAC("succeeded"))
    }
  } catch (e) {
    yield handleServerNetworkError(e);
  }
}

export function* changeTodolistWorker( action: ReturnType<typeof changeTodolistWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.updateTodolist, action.id, action.title)
    if (res.data.resultCode === 0) {
      yield put(changeTodolistTitleAC(action.id, action.title))
      yield put(setAppStatusAC("succeeded"))
    }
  } catch (e) {
    yield handleServerNetworkError(e);
  }
}

export const fetchTodolistsWC = { type: "FETCH_TODOLISTS_WC" }
export const removeTodolistWC = ( todolistId: string ) =>
  ({ type: "REMOVE_TODOLIST_WC", todolistId })
export const addTodolistWC = ( title: string ) =>
  ({ type: "ADD_TODOLIST_WC", title })
export const changeTodolistWC = ( id: string, title: string ) =>
  ({ type: "CHANGE_TODOLIST_WC", id, title })

export function* fetchTodolistsWatcher() {
  yield takeEvery("FETCH_TODOLISTS_WC", fetchTodolistsWorker)
  yield takeEvery("REMOVE_TODOLIST_WC", removeTodolistWorker)
  yield takeEvery("ADD_TODOLIST_WC", addTodolistWorker)
  yield takeEvery("CHANGE_TODOLIST_WC", changeTodolistWorker)
}
