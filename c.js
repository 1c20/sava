const fs = require('fs')
var file = fs.readFileSync('hello.sv').toString()
function log(...args){console.log(args.join(" "))}
var main = []
var operation = {}

function define(line){
    line = line.split(" ").slice(1)
    var name = line[0]
    line = line.join(" ").split("=").slice(1)
    var variable = line[0].trim()

    if(variable.startsWith("\"")){
        variable = /\"(.*?)\"/.exec(variable)[1]
        operation[name] = {}
        operation[name]['value'] = variable.split("")
        operation[name]['type'] = 'string'
    }
    else if(variable.startsWith("|")){
        variable = /\|(.*?)\|/.exec(variable)[1].split(",").map(el => el.trim())
        operation[name] = {}
        operation[name]['value'] = variable
        operation[name]['type'] = 'list'        
    }    
}

function print(line){
    line = /print\((.*?)\)/.exec(line)[1].split("+").map(el => el.trim())        

    var message = ''
    
    line.forEach(part =>{
        if(part.startsWith("%")){
            if(part.includes("[")){
                var ex = /\[(.*?)\]/.exec(part)
                var id = parseInt(ex[1])
                part = part.replace(ex[0],'').split("%")[1]                    
                message += operation[part]['value'][id]
            }
            else{
                part = part.split("%")[1]
                if(operation[part]['type'] == 'list'){
                    message += "|" + operation[part]['value'].join(", ") + "|"

                }else message += operation[part]['value'].join("")
            }
        }
        else if(part.startsWith("\"")){
            part = /\"(.*?)\"/.exec(part)
            message += part[1]        
        }
        
    })
    console.log(message);
}


    function fun(parent, kids){
        kids = kids.map(kid => kid.trim())
        if(parent.startsWith("loop")){
            parent = parent.split(" ")
            if(parent.length == 3){
            var target = parent[1]
            var key = parent[2]
            
            
            if(operation[target.split("%")[1]]['type'] == 'list'){

                for(i of operation[target.split("%")[1]]['value']){
                operation[key.split("%")[1].split(":")[0]] = {}
                operation[key.split("%")[1].split(":")[0]]['value'] = i.split("") 
                               
                kids.forEach(kid =>{
                    translate(kid)
                })
                
                
                }
                
            }else{
                console.warn('sorry')
            }
            
        }
            
        else{
            var target = parent[1]
        }
            
        }
    }


function translate(line){
    if(!line.endsWith(":")){
            if(line.startsWith("define")){
                define(line)
            }
            else if(line.startsWith("print")){
                print(line)
            }
            else if(line.startsWith("kill()")){
                process.exit()
            }
    }
}






var filtered = file.split('\n').filter(line =>{
    return line != ''
})
.filter(line => !line.startsWith("#")).map(line =>{
    if(line.includes("#")){
        var res = line.slice(0,line.indexOf("#"));
        return res
    }
        else{            
            return line
        }  
})
.map(line => {
    if(!line.startsWith("  ")) {line = line.trim() ; return line}
    else return line
})


var work = filtered.map(line =>{
    arp = []
    if(line.endsWith(":")){
        var pos = filtered.indexOf(line)
        var missions = filtered.slice(pos)
        .filter(line =>{            
            return line.startsWith("  ")
        })
       return missions
    }
    else{
        return line
    }
})

work = work.filter(x => {
    if(typeof x != 'object'){
        if(!x.startsWith("  ")) return x
    }
    else return x
})


work.forEach(line =>{
    if(typeof line != 'object'){
    translate(line)
    }
    else{
        var parent = work.indexOf(line)
        var actor = work[parent][0]
        var realParent = filtered[filtered.indexOf(actor) - 1 ]
        fun(realParent, line)
        
        
    }
})



