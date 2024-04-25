function oneOfThem(str, strs, strict = false) {
    for (let s of strs) {
        if (strict) {
            if (str === s) {
                return true;
            }
        } else if (str.includes(s)) {
            return true;
        }
    }
    return false;
}

function getSubTitleButtons() {

    // Access the button that opens the subtitle menu. This might change depending on YouTube updates.
    const settingsButton = document.querySelector('button.ytp-settings-button');
    settingsButton?.click();

    // We need to navigate the menu to reach the subtitles; this involves several steps which might need updates if YouTube changes its UI
    const menuItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
    const subtitlesButton = menuItems.find(item => {
        const label = item.querySelector('.ytp-menuitem-label')?.textContent?.trim();
        return oneOfThem(label, ['Subtitles', '字幕']);
    });

    subtitlesButton?.click();

    const subtitleBtns = {};
    // Collect all available subtitle options
    const subtitleOptions = Array.from(document.querySelectorAll('.ytp-menuitem'));
    subtitleOptions.forEach(option => {
        const btn = option.querySelector('.ytp-menuitem-label');
        const label = btn?.textContent?.trim();
        if (oneOfThem(label, ['Subtitles', '字幕'])) {
            subtitleBtns['off'] = btn;
        } else if (oneOfThem(label, ['自動翻譯', 'Auto-translate'], true)) {
            subtitleBtns['auto'] = btn;
        } else {
            subtitleBtns[label] = btn;
        }
    });

    return subtitleBtns;
}

function nameScore(label) {
    let score = 0
    if (oneOfThem(label, ['auto', 'off', ' >> '])) {
        return -1;
    } else {
        if (oneOfThem(label, ['Chinese', '中文'])) {
            score = 100;
            if (oneOfThem(label, ['Hong Kong', '香港'])) {
                score += 90;
            } else if (oneOfThem(label, ['Traditional', '繁體'])) {
                score += 80;
            } else if (oneOfThem(label, ['Taiwan', '台灣'])) {
                score += 70;
            } else if (oneOfThem(label, ['Simplified', '簡體', '简体', '中國', '中国'])) {
                score = 1;
            }
        } else if (oneOfThem(label, ['English', '英文'])) {
            score = 10;
            if (oneOfThem(label, ['auto', '自動'])) {
                score += -1;
            }
        }
    }
    return score
}

//================================================================================================

function isVideoPage() {
    return /youtube\.com\/watch\?/.test(window.location.href);
}

function handleURLChange() {
    //console.log('handleURLChange:',window.location.href);
    if (isVideoPage()) {
        //console.log('isVideoPage');

        setTimeout(() => {
            const ccButton = document.querySelector('button.ytp-subtitles-button');
            //console.log('handleURLChange ccButton',ccButton);
            if (!ccButton) return;
            if (ccButton.getAttribute('aria-pressed') !== "true") {
                return
            }

            const subtitleBtns = getSubTitleButtons()
            //console.log(subtitleBtns);
            let targetBtn = null
            let currSore = 0
            let currlabel = ''
            for (let label in subtitleBtns) {
                let score = nameScore(label)
                //console.log('score',label,score);
                if (score > currSore) {
                    currSore = score
                    targetBtn = subtitleBtns[label]
                    currlabel = label;
                }
            }
            if (currSore === 1) {
                subtitleBtns['auto'].click();
                const subtitleBtns2 = Array.from(document.querySelectorAll('.ytp-menuitem'));
                const tcbtn = subtitleBtns2.find(item => {
                    const label = item.textContent?.trim();
                    //console.log("label2",label,)
                    if (oneOfThem(label, ['繁體', 'Traditional'])) {
                        return true;
                    }
                })
                if (tcbtn) {
                    //console.log("click tcbtn",tcbtn)
                    tcbtn.querySelector('.ytp-menuitem-label')?.click();
                    console.log("change CC:sc>tc")
                    targetBtn = null;
                }

                //todo..auto tran?
            }
            if (targetBtn) {
                console.log("change CC", currlabel)
                targetBtn.click();
            }
            setTimeout(() => {
                const settingsButton = document.querySelector('button.ytp-settings-button');
                if (settingsButton && settingsButton.getAttribute('aria-expanded') === "true") {
                    settingsButton?.click();
                }
            }, 500)
        }, 500)
    }
}

const observer = new MutationObserver((mutations, obs) => {
    // Since URL changes do not affect body attributes directly on YouTube, we track changes by looking at other indicators like title or relevant nodes
    if (mutations.some(mutation => mutation.type === 'childList' || mutation.type === 'attributes')) {
        const newURL = window.location.href;
        if (currentURL !== newURL) {
            currentURL = newURL; // Update the current URL
            handleURLChange();
        }
    }
});

// Current URL to compare against new URL
let currentURL = window.location.href;

// Observe the document's body for childList changes or attribute changes
observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true // To observe changes deeply throughout the DOM tree
});


handleURLChange();