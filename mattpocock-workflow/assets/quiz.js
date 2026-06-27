/* ==========================================================================
   Reusable retrieval-practice quiz widget.
   Usage in a lesson:
     <div class="quiz" data-quiz='[{"q":"...","options":["A","B"],"answer":0,
       "why":"explanation shown after answering"}]'></div>
     <script src="../assets/quiz.js"></script>
   Design notes (from teach skill):
     - Retrieval practice over recognition: prompts force recall before reveal.
     - Immediate, automatic feedback (the tight loop).
     - Keep option lengths even in the lesson data so formatting gives no clue.
   ========================================================================== */
(function () {
  function styleInject() {
    if (document.getElementById("quiz-styles")) return;
    var css = `
      .quiz { font-family: var(--sans); border: 1px solid var(--rule);
        border-radius: 8px; padding: 1.1rem 1.2rem; margin: 1.6rem 0; background:#fff; }
      .quiz .qtext { font-weight: 600; margin: 0 0 0.8rem; font-size: 0.98rem; }
      .quiz .qnum { font-size: 0.68rem; letter-spacing:0.1em; text-transform:uppercase;
        color: var(--ink-soft); display:block; margin-bottom:0.3rem; }
      .quiz button.opt { display:block; width:100%; text-align:left; font:inherit;
        font-size:0.9rem; margin:0.35rem 0; padding:0.55rem 0.75rem; cursor:pointer;
        background:#faf8f3; border:1px solid var(--rule); border-radius:6px; color:var(--ink);
        transition: background .12s, border-color .12s; }
      .quiz button.opt:hover { border-color: var(--ink-soft); }
      .quiz button.opt.correct { background:#e9f4ec; border-color:var(--good); color:var(--good); font-weight:600; }
      .quiz button.opt.wrong { background:#f8e9e4; border-color:var(--bad); color:var(--bad); }
      .quiz button.opt:disabled { cursor:default; }
      .quiz .why { font-size:0.86rem; color:var(--ink-soft); margin-top:0.7rem;
        padding-top:0.7rem; border-top:1px solid var(--rule); display:none; }
      .quiz .why.show { display:block; }
      .quiz .score { font-size:0.82rem; color:var(--ink-soft); margin-top:0.6rem; font-style:italic; }
    `;
    var s = document.createElement("style");
    s.id = "quiz-styles"; s.textContent = css; document.head.appendChild(s);
  }

  // Fisher-Yates shuffle so the correct option is never positionally predictable.
  // Returns {options:[...], answer:newIndex} with the answer remapped.
  function shuffleOptions(options, answer) {
    var idx = options.map(function (_, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    return {
      options: idx.map(function (i) { return options[i]; }),
      answer: idx.indexOf(answer)
    };
  }

  function build(el) {
    var data;
    try { data = JSON.parse(el.getAttribute("data-quiz")); }
    catch (e) { el.textContent = "Quiz data error: " + e.message; return; }

    var total = data.length, answered = 0, correctCount = 0;
    var scoreEl = document.createElement("div");
    scoreEl.className = "score";

    data.forEach(function (rawItem, qi) {
      // Shuffle each question's options so the answer's position carries no signal.
      var shuffled = shuffleOptions(rawItem.options, rawItem.answer);
      var item = { q: rawItem.q, why: rawItem.why,
        options: shuffled.options, answer: shuffled.answer };

      var block = document.createElement("div");
      if (qi > 0) block.style.marginTop = "1.4rem";

      var qn = document.createElement("span");
      qn.className = "qnum";
      qn.textContent = "Recall " + (qi + 1) + " / " + total;
      block.appendChild(qn);

      var q = document.createElement("p");
      q.className = "qtext";
      q.textContent = item.q;
      block.appendChild(q);

      var why = document.createElement("div");
      why.className = "why";
      why.textContent = item.why || "";

      item.options.forEach(function (opt, oi) {
        var b = document.createElement("button");
        b.className = "opt";
        b.textContent = opt;
        b.addEventListener("click", function () {
          var siblings = block.querySelectorAll("button.opt");
          siblings.forEach(function (s) { s.disabled = true; });
          if (oi === item.answer) {
            b.classList.add("correct");
            correctCount++;
          } else {
            b.classList.add("wrong");
            siblings[item.answer].classList.add("correct");
          }
          why.classList.add("show");
          answered++;
          scoreEl.textContent = "Answered " + answered + " of " + total +
            " · " + correctCount + " correct.";
        });
        block.appendChild(b);
      });

      block.appendChild(why);
      el.appendChild(block);
    });

    el.appendChild(scoreEl);
  }

  function init() {
    styleInject();
    document.querySelectorAll(".quiz[data-quiz]").forEach(build);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
