import { Theme } from './types';

export const createRootCssContent = (
  theme: Theme
): string => {
  const propertyToVariableMap = {
    'colors.primary': '--primary-color',
    'colors.textPrimary': '--text-primary-color',
    'colors.textSecondary': '--text-secondary-color',
    'colors.textTertiary': '--text-tertiary-color',
    'colors.backgroundPrimary': '--background-primary-color',
    'colors.backgroundSecondary': '--background-secondary-color',
    'colors.accent': '--accent-color',
    'colors.border': '--border-color',
    'typography.fontSize': '--font-size',
    'typography.fontFamily': '--font-family',
    'typography.lineHeight': '--line-height',
    'typography.h1.margin': '--h1-margin',
    'typography.h1.padding': '--h1-padding',
    'typography.h1.fontSize': '--h1-font-size',
    'typography.h1.fontWeight': '--h1-font-weight',
    'typography.h1.lineHeight': '--h1-line-height',
    'typography.h2.margin': '--h2-margin',
    'typography.h2.padding': '--h2-padding',
    'typography.h2.fontSize': '--h2-font-size',
    'typography.h2.fontWeight': '--h2-font-weight',
    'typography.h2.lineHeight': '--h2-line-height',
    'typography.h3.margin': '--h3-margin',
    'typography.h3.padding': '--h3-padding',
    'typography.h3.fontSize': '--h3-font-size',
    'typography.h3.fontWeight': '--h3-font-weight',
    'typography.h3.lineHeight': '--h3-line-height',
    'typography.h4.margin': '--h4-margin',
    'typography.h4.padding': '--h4-padding',
    'typography.h4.fontSize': '--h4-font-size',
    'typography.h4.fontWeight': '--h4-font-weight',
    'typography.h4.lineHeight': '--h4-line-height',
    'typography.h5.margin': '--h5-margin',
    'typography.h5.padding': '--h5-padding',
    'typography.h5.fontSize': '--h5-font-size',
    'typography.h5.fontWeight': '--h5-font-weight',
    'typography.h5.lineHeight': '--h5-line-height',
    'typography.h6.margin': '--h6-margin',
    'typography.h6.padding': '--h6-padding',
    'typography.h6.fontSize': '--h6-font-size',
    'typography.h6.fontWeight': '--h6-font-weight',
    'typography.h6.lineHeight': '--h6-line-height'
  };

  const cssVariablesContent = Object.entries(propertyToVariableMap)
    .map(([property, variable]) => `${variable}: ${getThemeValue(theme, property)};`)
    .join('\n');

  return `:root {\n${cssVariablesContent}\n}\n`;
};

function getThemeValue (theme: Theme, path: string) {
  return path.split('.').reduce((acc, key) => acc[key], theme);
}
