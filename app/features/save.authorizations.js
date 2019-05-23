let SaveAuthorizations = function(database) {
    this.database = database;
};
SaveAuthorizations.prototype.useDatabase = function(database) {
    this.database = database;
}

SaveAuthorizations.prototype.now = async function(formId, authorizations, callback) {
    let error;
    var self = this
    var saveOneAuthorization = (formId, authorization) => {
        var p = new Promise((resolve, reject)=>{
            this.database.saveAuthorization(formId, authorization, (rows, err)=>{
                if (err) {
                    error = err
                    reject(error)
                }
                else { resolve() }
            })
        });
        return p
    };
    try {
        var deleteAuthorizations = new Promise((resolve, reject)=>{
            this.database.deleteAuthorizations(formId, (rows, err)=>{
                if (err) {
                    error = err
                    reject(error)
                }
                else { resolve() }
            })
        })
        await deleteAuthorizations
        for (var index=0; index<authorizations.length; index++) {
            var authorization = authorizations[index];
            await saveOneAuthorization(formId, authorization);
        }
    }
    catch (ignored) { }
    finally {
        if (error) {
            callback({ error: { code:500, message:error.message }})
        }
        else {
            callback(formId)
        }
    }
};

module.exports = SaveAuthorizations;