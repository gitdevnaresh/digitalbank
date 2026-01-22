import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import encryptTransform from "../../utils/encryptionTransfor";
import userReducer from "./userReducer";
import { createKeychainStorage } from "redux-persist-keychain-storage";
const keychainStorage = createKeychainStorage();
const persistConfig = {
  key: "root",
  storage:keychainStorage, 
  whitelist: ["userReducer"], 
  transforms: [encryptTransform],
};
const rootReducer = combineReducers({
  userReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
export const persistor = persistStore(store);