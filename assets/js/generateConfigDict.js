const fs = require('fs');
const path = require('path');

const configDict = require('../img/project/config');

const deviceType = 'web';
const commonPath = `/assets/img/project/`;
const currentWorkingDir = process.cwd();
const absolutePath = path.join(currentWorkingDir,commonPath);

console.log('absolutePath',absolutePath);
const projectImages = {};

const generateProjectImages = ()=>{
    try {
        fs.readdir(absolutePath, (err, files)=>{
            if(err) throw err;
    
            files.forEach(file=>{
                const projectName = file;
                const projectPath = path.join(absolutePath, file);
    
                fs.stat(projectPath, (err, stat)=>{
                    if(err) throw err;
    
                    if(stat.isDirectory()){
                        console.log('projectPath', projectPath);
                        
                        const webProjectPath = path.join(projectPath, deviceType);

                        fs.readdir(webProjectPath, (err, files)=>{
                            if(err) throw err;
    
                            files.forEach(file=>{
                                const imgRelativePath = path.join(webProjectPath, file).replace(currentWorkingDir+'/', '');
    
                                if(!projectImages[projectName]){
                                    projectImages[projectName] = [];
                                }
                                projectImages[projectName].push(imgRelativePath);
    
                            })
                        })
                        // var imagesTemplateString = 
    
                    }
                })
            })
        })
    } catch (error) {
        console.error('error happens',error);
        process.exit(1);    
    }
}

generateProjectImages();

try {
    setTimeout(() => {
        console.log('projectImages',projectImages);
    
        // attach projectImages to configDic for each project
        configDict.project.forEach(project =>{
            if(!projectImages[project.projectName]) throw `project ${project.projectName} not exist in projectImages]`
            project['projectImages'] = projectImages[project.projectName]
        })
    
        console.log('configDict',configDict);

        fs.writeFile(path.join(currentWorkingDir,'/assets/js/configDict.js'), 'const configDict='+JSON.stringify(configDict),'utf-8',()=>{
            console.log('----configDict generated !!!----')
        });
    }, 1000);
} catch (error) {
    console.error(error);
}


