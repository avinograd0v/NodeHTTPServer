import loadConfig from 'load-config-file';

const confParseRegexp = /^(\w+)\s([^\s]+)/mg;
loadConfig.register('.conf', context => {
  const parsedObject = {};

  let option;
  while ((option = confParseRegexp.exec(context)) !== null) {
    const [, optionName, optionValue] = option;
    parsedObject[optionName] = +optionValue || optionValue;
  }

  return parsedObject
});

export default filename => loadConfig(filename);
