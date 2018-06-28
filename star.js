const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router('safe/data.json');
const request = require('request');
const middlewares = jsonServer.defaults({
    bodyParser:true
});

var log4js = require('log4js');
log4js.configure({
    appenders: {
        fileLog: {
            type: 'file',
            filename: './logs/ExecutionLog.log',
            maxLogSize: 2048,
            backups:3,
            category: 'normal'
        },
        console: { type: 'console' }
    },
    categories: {
        file: { appenders: ['fileLog'], level: 'error' },
        another: { appenders: ['console'], level: 'info' },
        default: { appenders: ['console', 'fileLog'], level: 'info' }
    },
    replaceConsole: true
});
var logger = log4js.getLogger('normal');




var count = 1;
const engines = require('consolidate');
const session = require('client-sessions');
server.engine('html', engines.mustache);
server.set('views',path.join(__dirname,'public'));
server.set('view engine', 'html');
const user = 'univser';
const manage='superManage';
server.use(middlewares);

server.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));
server.use(function(req, res, next) {
    if (req.session && req.session.user) {
        if (req.session.user) {
            res.locals.user = user;
        }
        // finishing processing the middleware and run the route
        next();
    } else {
        count++;
        req.session.user = user;;
        next();
    }
});
server.get('/mange',function (req,res) {
    if(req.session.user==manage) {
    	var code = '601';
        res.send(code)
    }else {

        res.send("没登录");
    }
})
server.get('/fasong',function (req,res) {
    //获取当前的访问人数
    res.send(""+count);
})
server.get('/aaa/:userid',function(req,res){
	res.redirect('/articles/'+req.params.userid);
})
server.get('/look/:userid',function(req,res){
	res.redirect('/articles?_page='+req.params.userid+'&_limit=4');
})
server.get('/aaa',function(req,res){
	res.redirect('/articles');
})

//写文章的请求
server.post('/write',function(req,res){
    if(req.session.user==manage) {
    	request({
            url: 'http://localhost:5050/articles/',
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(req.body)
        }, function(error, response, body) {
            res.send(body);
        }); 
    }
    
})
//修改文章的请求
server.put('/aaa/:userid',function(req,res){
    if(req.session.user==manage) {
    	request({
            url: 'http://localhost:5050/articles/'+req.params.userid,
            method: "put",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(req.body)
        }, function(error, response, body) {
            res.send(body);
        }); 
    
}});
server.get('/sss',function(req,res){
	res.redirect('/suggestion');
})
server.post('/sssWrite',function(req,res){
    request({
        url: 'http://localhost:5050/suggestion',
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(req.body)
    }, function(error, response, body) {
        
        res.send(body);
    }); 
	
})
//删除文章的请求
server.delete('/ddd/:userid',function(req,res){
    if(req.session.user==manage) {
        request({
            url: 'http://localhost:5050/articles/'+req.params.userid,
            method: "delete",
           
        }, function(error, response, body) {
            res.send(body);
        }); 
    }
   
})
server.delete('/removeSugg/:userid',function(req,res){
    if(req.session.user==manage) {
        request({
            url: 'http://localhost:5050/suggestion/'+req.params.userid,
            method: "delete",
           
        }, function(error, response, body) {
            res.send(body);
        }); 
    }else{
        res.send('不是管理员')
    }
})


// 	}
// })
server.post('/enter', function(req, res) {
            if (req.body.name=='13296570239') {
                // res.render('login.jade', { error: 'Invalid email or password.' });

                if(req.body.userpassword =='wangjiang1024') {

                    // sets a cookie with the user's info
                    req.session.user = manage;
                    var data = {
                    	"msg" : "密码正确",
                    	"code" : 501
                    }
                    res.send(JSON.stringify(data))
                } else {
                    // res.render('login.jade', { error: 'Invalid email or password.' });
                   // scrit=scrit-1;
                    res.send(404);
                }
            } else {
                // res.render('login.jade', { error: 'Invalid email or password.' });
                res.send(404)
            }
});
server.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));
server.use(router);
server.listen(5050, () => {
    console.log('JSON Server is running')

});