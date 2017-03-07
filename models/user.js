var bcrypt = require('bcrypt');
var _ = require('underscore');
module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL, //its not set to DB actually
            allowNull: false,
            validate: {
                len: [6, 100]
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10); // generate salt max len=10
                var hashedPassword = bcrypt.hashSync(value, salt);
                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                if (typeof user.email === 'string' && user.email.trim().length > 0) {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: { //class Methods
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (!(body.hasOwnProperty('email') && _.isString(body.email) && body.email.trim().length > 0)) {
                        return reject();
                    } else if (!(body.hasOwnProperty('password') && _.isString(body.password) && body.password.trim().length > 0)) {
                        return reject();
                    } else {
                        user.findOne({
                                where: {
                                    email: body.email
                                        //password:body.password
                                }
                            })
                            .then(function(user) {
                                if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                     reject();
                                }
                                 resolve(user);
                            }, function(error) {
                                 reject();
                            })
                    }
                })
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }

    });

    return user;
}
