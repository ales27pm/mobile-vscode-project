const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your plugin ID (e.g., my-cool-plugin)',
        default: this.appname.replace(/\s+/g, '-'),
      },
    ]).then((props) => {
      this.props = props;
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('plugin.ts'),
      this.destinationPath('plugin.ts'),
      { id: this.props.name }
    );
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      { name: this.props.name }
    );
  }
};
