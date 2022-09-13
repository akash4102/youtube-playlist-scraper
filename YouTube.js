const puppeteer=require("puppeteer");
const pad=require("pdfkit");
const fs=require('fs');
let link="https://www.youtube.com/playlist?list=PLW-S5oymMexXTgRyT3BWVt_y608nt85Uj";
let cTab;
(async function(){
    try {
        let browserOpen=puppeteer.launch({
            headless:false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        let browserInstance=await browserOpen;
        let allTabs=await browserInstance.pages();
        cTab=allTabs[0];
        await cTab.goto(link);
        await cTab.waitForSelector('h1#title');
        let name=await cTab.evaluate(function(select){return document.querySelector(select).innerText},'h1#title');
        let allData=await cTab.evaluate(getData,'#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer')
        console.log(name,allData.noOfVideos,allData.noOfViews);
        let totalVideos=allData.noOfVideos.split(" ")[0];
        console.log(totalVideos);
        let currentVideos=await getCVideosLength();
        console.log(currentVideos);
        while(totalVideos-currentVideos>=1){
            await scrollToBotton();
            currentVideos=await getCVideosLength();
        }
        let finalList=await getStats();
        console.log(finalList);
        let pdfDoc=new pdf;
        pdfDoc.pipe(fs.createWriteStream('play.pdf'));
        pdfDoc.text(JSON.stringify(finalList));
        pdfDoc.end();

    } catch (error) {
        console.log(error);
    }
})();
async function getStats(){
    let list=await cTab.evaluate(getNameAndDuration,'#video-title','#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer')
    return list;
}
function getNameAndDuration(videoSelector,durationSelector){
    let videoElem=document.querySelectorAll(videoSelector);
    let durationElem=document.querySelectorAll(durationSelector);
    let currentList=[];
    for(let i=0;i<durationElem.length;i++){
        let videoTitle=videoElem[i].innerText;
        let duration=durationElem[i].innerText;
        currentList.push({videoTitle,duration});
    }
    return currentList;
}
async function scrollToBotton(){
    await cTab.evaluate(goToBottom)
    function goToBottom(){
        window.scrollBy(0,window.innerHeight);
    }
}

async function getCVideosLength(){
    let length=await cTab.evaluate(getLength,'#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    return length;

}
function getLength(durationSelect){
    let durationElem=document.querySelectorAll(durationSelect);
    return durationElem.length;
}
function getData(selector){
    let allElems=document.querySelectorAll(selector);
    let noOfVideos=allElems[0].innerText;
    let noOfViews=allElems[1].innerText;
    return {
        noOfVideos,noOfViews
    };
}