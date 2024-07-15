import { Dimensions } from "react-native";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

export const SPACING = 16;
export const BAR_HEIGHT = Constants.statusBarHeight;

export const GRID_WIDTH_CONUT = 12;
export const GRID_CELL_SIZE = (width - SPACING * 2) / GRID_WIDTH_CONUT;
export const PICKER_HEIGHT = GRID_CELL_SIZE * 10;
export const PICKER_WIDTH = GRID_CELL_SIZE * GRID_WIDTH_CONUT;
export const INDICATOR_SIZE = GRID_CELL_SIZE * 1.2;

export const RAD2DEG = 180 / Math.PI;
export const TAU = Math.PI * 2;
