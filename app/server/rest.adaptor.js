let SearchFormSeven = require('../features/search.form.7');
let MyCases = require('../features/my.cases');
let SaveFormTwo = require('../features/save.form.2');
let SavePerson = require('../features/save.person');
let PersonInfo = require('../features/person.info');

let RestAdaptor = function() {
    this.renderSearchFormSevenResult = function(data, response) { response.write( JSON.stringify({ parties:data })); response.end(); };
    this.renderMyCasesResult = function(data, response) { response.write( JSON.stringify({ cases:data })); response.end(); };    
    this.renderSaveFormTwoResult = function(id, response) { 
        response.writeHead(201, {'Location': '/forms/' + id});
        response.write(JSON.stringify({}));
        response.end();
    };
    this.renderSavePersonResult = function(id, response) { 
        response.writeHead(201, {'Location': '/persons/' + id});
        response.write(JSON.stringify({}));
        response.end();
    };
    this.renderPersonInfoResult = function(person, response) { 
        if (person !== undefined) {
            response.write(JSON.stringify(person));
        } 
        else {
            response.statusCode = 404;
        }
        response.end();
    };
};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
};
RestAdaptor.prototype.useTokenValidator = function(tokenValidator) { 
    this.tokenValidator = tokenValidator; 
};
RestAdaptor.prototype.useDatabase = function(database) {
    this.myCases = new MyCases(database);     
    this.saveFormTwo = new SaveFormTwo(database); 
    this.savePerson = new SavePerson(database); 
    this.personInfo = new PersonInfo(database);
};
RestAdaptor.prototype.route = function(app) {   
    app.use((request, response, next)=> {
        if(this.tokenValidator) {
            let token = request.query? 
                request.query.token : 
                request.body? request.body.token : undefined;
            this.tokenValidator.validate(token, (isValid) => {
                if (!isValid) {
                    response.statusCode = 403;     
                    response.end();            
                } else {
                    next();
                }
            });        
        }
        else {
            next();
        }
    });     

    app.get('/api/forms', (request, response)=> {
        this.searchFormSeven.now({ file:parseInt(request.query.file) }, (data)=> {
            this.renderSearchFormSevenResult(data, response);
        });
    });
    app.post('/api/forms', (request, response)=> {
        let login = request.headers['x-user'];
        this.savePerson.now(login, (id)=> {
            let params = request.body;
            params.data = JSON.parse(params.data);
            params.person_id = id;
            this.saveFormTwo.now(params, (data)=> {
                this.renderSaveFormTwoResult(data, response);
            });           
        });
    });
    app.get('/api/cases', (request, response)=> {
        let login = request.headers['x-user'];
        this.myCases.now(login, (data)=> {                    
            this.renderMyCasesResult(data, response);
        });
    });
    app.post('/api/persons', (request, response)=> {
        let params = request.body;
        let person = params.data;
        this.savePerson.now(person, (data)=> {
            this.renderSavePersonResult(data, response);
        });          
    });
    app.get('/api/persons/:login', (request, response, next)=> {
        let login = request.params.login;
        this.personInfo.now(login, (data)=> {
            this.renderPersonInfoResult(data, response);
        });
    });
    app.get('/*', function (req, res) { res.send( JSON.stringify({ message: 'pong' }) ); });
};


module.exports = RestAdaptor;