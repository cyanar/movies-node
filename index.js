  const util = require('util');
    const fetch = util.promisify(require('./fetch.js'));
    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    const fs = require('fs');
    const config = require('./config.json');
    var express = require('express');
    var app = express();
    var request = require('request');
    const path = require('path');

    (function () {
        Promise.all(fetchHandler())
            .then(d => parseHTML(d))
            .then(d => saveToFile(d));
    })()
    
    function fetchHandler(){
        let promiseList = [];
        for (let i = 1; i <= config.pageMaxNum; i++) {
            promiseList.push(fetch(getSourceURL(i)));
        }
        return promiseList;
    }
    
    function getSourceURL(index) {
        return `http://list.iqiyi.com/www/1/-------------11-${index}-1-iqiyi--.html`
    }
    
    function parseHTML(html) {
        const dom = new JSDOM(html);
        let aList = dom.window.document.querySelectorAll('div.site-piclist_pic > a');
        let imgList = dom.window.document.querySelectorAll('div.site-piclist_pic > a > img')
        aList = Array.from(aList);
        imgList = Array.from(imgList);
        return aList.map((a, index) => {
            return {
                source: a.href,
                title: a.title,
                img: imgList[index].src,
                url: `${config.parseURL}${a.href}`
            }
        });
    }
    
    function saveToFile(data) {
        let str = JSON.stringify(data);
        fs.writeFile('./data.json', str, { flag: 'w+' }, (err) => {
            if (err) console.log(err);
        })
    }

   function readFile() {
        fs.readFile('./data.json', function (err, data) {
            if (err) {
                return callback(err);
            }
           callback(null,data.toString());
        });
   }

    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/list', function (req, res) {  //get请求
        fs.readFile('./data.json', function(err,data) {
            if(err){
                res.send("文件读取失败");
            }else{
                if(JSON.parse(data).length == 0) {
                    res.end('暂无数据');
                }else{
                    // JSON.parse(data).forEach(function(v){
                    //     res.write("img:" + v.img + "\n");
                    // })
                    res.json(JSON.parse(data));
                }
                // res.send();
            }
        })
    });

    app.listen(3000, () => {
            console.log(`App listening at port 3000`)
    })