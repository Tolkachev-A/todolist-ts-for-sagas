import {setAppStatusAC} from "../../app/app-reducer";
import {call, put, select, takeEvery} from "redux-saga/effects";
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api";
import {AxiosResponse} from "axios";
import {addTaskAC, removeTaskAC, setTasksAC, UpdateDomainTaskModelType, updateTaskAC} from "./tasks-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";

export function* fetchTasksWorker( action: ReturnType<typeof fetchTasksWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, action.todolistId)
    const tasks = res.data.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC("succeeded"))
  } catch (e) {
    yield handleServerNetworkError(e)
  }
}

export function* removeTaskWorker( action: ReturnType<typeof removeTaskWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
    if (res.data.resultCode === 0) {
      yield put(removeTaskAC(action.taskId, action.todolistId))
      yield put(setAppStatusAC("succeeded"))
    } else {
      handleServerAppError(res.data);
    }
  } catch (e) {
    yield handleServerNetworkError(e)
  }
}

export function* AddTaskWorker( action: ReturnType<typeof addTaskWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<ResponseType<{ item: TaskType }>> = yield call(todolistsAPI.createTask, action.todolistId, action.title)
    if (res.data.resultCode === 0) {
      const task = res.data.data.item
      yield put(addTaskAC(task))
      yield put(setAppStatusAC("succeeded"))
    } else {
      handleServerAppError(res.data);
    }
  } catch (e) {
    yield handleServerNetworkError(e)
  }
}

export function* updateTaskWorker( action: ReturnType<typeof updateTaskWC> ) {

  const task = yield select(state => state.tasks[ action.todolistId ].find(( t: TaskType ) => t.id === action.taskId))

  const apiModel: UpdateTaskModelType = {
    deadline: task.deadline,
    description: task.description,
    priority: task.priority,
    startDate: task.startDate,
    title: task.title,
    status: task.status,
    ...action.domainModel
  }
  try {
    yield put(setAppStatusAC("loading"))
    const res: AxiosResponse<ResponseType<TaskType>> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
    if (res.data.resultCode === 0) {
      yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
      yield put(setAppStatusAC("succeeded"))
    } else {
      handleServerAppError(res.data);
    }
  } catch (e) {
    yield handleServerNetworkError(e)
  }
}


export const fetchTasksWC = ( todolistId: string ) =>
  ({ type: "FETCH_TACKS_WC", todolistId })
export const removeTaskWC = ( taskId: string, todolistId: string ) =>
  ({ type: "REMOVE_TACK_WC", taskId, todolistId })
export const addTaskWC = ( title: string, todolistId: string ) =>
  ({ type: "ADD_TACK_WC", title, todolistId })
export const updateTaskWC = ( taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string ) =>
  ({ type: "UPDATE_TACK_WC", taskId, domainModel, todolistId })

export function* fetchTasksWatcher() {
  yield takeEvery("FETCH_TACKS_WC", fetchTasksWorker)
  yield takeEvery("REMOVE_TACK_WC", removeTaskWorker)
  yield takeEvery("ADD_TACK_WC", AddTaskWorker)
  yield takeEvery("UPDATE_TACK_WC", updateTaskWorker)
}
