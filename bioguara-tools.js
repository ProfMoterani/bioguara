
(function(){
  'use strict';

  function $(id){ return document.getElementById(id); }

  function loadJSON(key, fallback){
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch(e){ return fallback; }
  }

  function saveJSON(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function downloadText(filename, text){
    var blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function escapeHTML(value){
    return String(value).replace(/[&<>"']/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);
    });
  }

  function abrirRelatorioBioguara(titulo, subtitulo, corpoHtml){
    var data = new Date().toLocaleDateString('pt-BR');
    var win = window.open('', '_blank');
    if(!win){
      alert('O navegador bloqueou a janela do relatório. Autorize pop-ups para este site.');
      return;
    }
    var doc = [
      '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>', escapeHTML(titulo), '</title>',
      '<style>',
      '@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#241006;margin:0;background:#fff;line-height:1.45}',
      '.actions{margin:18px 0;display:flex;gap:10px}.actions button{border:0;background:linear-gradient(135deg,#ff7a1a,#d94a07);color:#fff;border-radius:999px;padding:10px 16px;font-weight:bold;cursor:pointer}',
      '.report-header{display:flex;align-items:center;gap:14px;border-bottom:3px solid #f26a16;padding-bottom:12px;margin-bottom:16px}.report-logo{width:64px;height:64px;object-fit:contain}.report-title{margin:0;font-size:24px;color:#351305;text-transform:uppercase}.report-subtitle{margin:3px 0 0;font-size:13px;color:#7a3a14}',
      '.student-line{display:grid;grid-template-columns:1fr 130px;gap:18px;margin:14px 0 18px;font-size:13px}.line{border-bottom:1px solid #999;min-height:22px;display:inline-block;width:100%}',
      '.report-section{page-break-inside:avoid;break-inside:avoid;border:1px solid #f0bd8a;border-left:6px solid #f26a16;border-radius:10px;padding:12px 14px;margin-bottom:12px;background:#fffaf2}.report-section h2{margin:0 0 8px;color:#351305;font-size:18px}.report-section p{margin:4px 0}.checkline{display:inline-block;margin-right:16px;font-weight:bold}.meta{color:#6b3a12;font-size:13px}',
      'table{width:100%;border-collapse:collapse;margin-top:8px}tr{page-break-inside:avoid;break-inside:avoid}th{background:#f26a16;color:#fff;text-align:left;padding:8px;font-size:12px}td{border:1px solid #f0bd8a;padding:8px;font-size:12px;vertical-align:top}',
      '.footer{border-top:1px solid #f0bd8a;margin-top:18px;padding-top:8px;font-size:11px;color:#7a3a14;display:flex;justify-content:space-between;gap:10px}',
      '@media print{.actions{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}',
      '</style></head><body>',
      '<div class="actions"><button onclick="window.print()">Salvar como PDF / Imprimir</button><button onclick="window.close()">Fechar</button></div>',
      '<header class="report-header"><img class="report-logo" src="assets/logo-bioguara.png" alt="Logo Bioguará"><div><h1 class="report-title">', escapeHTML(titulo), '</h1><p class="report-subtitle">', escapeHTML(subtitulo), '</p></div></header>',
      '<div class="student-line"><div>Aluno(a): <span class="line"></span></div><div>Data: ', data, '</div></div>',
      corpoHtml,
      '<div class="footer"><span>www.profbioguara.com.br</span><span>Professor Lucas Costa Moterani • Bioguará</span></div>',
      '</body></html>'
    ].join('');
    win.document.open();
    win.document.write(doc);
    win.document.close();
  }

  function initRevisao(){
    var topic = $('revTopic'), date = $('revDate'), list = $('reviewList'), add = $('addReview');
    if(!topic || !date || !list || !add) return;
    var key = 'bioguaraRevisoes';
    if(!date.value) date.value = new Date().toISOString().slice(0,10);

    function load(){ return loadJSON(key, []); }
    function save(items){ saveJSON(key, items); }
    function addDays(base, days){
      var d = new Date(base + 'T12:00:00');
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0,10);
    }
    function fmt(d){ return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR'); }
    function render(){
      var items = load().sort(function(a,b){ return a.date.localeCompare(b.date); });
      if(!items.length){
        list.innerHTML = '<p>Nenhuma revisão cadastrada ainda.</p>';
        return;
      }
      list.innerHTML = items.map(function(it, i){
        return '<div class="review-item '+(it.done?'done':'')+'"><div><strong>'+escapeHTML(it.topic)+'</strong><span>'+escapeHTML(it.label)+' • '+fmt(it.date)+'</span></div><button type="button" data-i="'+i+'" class="mark-review">'+(it.done?'Concluída':'Marcar concluída')+'</button></div>';
      }).join('');
      document.querySelectorAll('.mark-review').forEach(function(btn){
        btn.addEventListener('click', function(){
          var arr = load().sort(function(a,b){ return a.date.localeCompare(b.date); });
          var i = Number(btn.dataset.i);
          arr[i].done = !arr[i].done;
          save(arr);
          render();
        });
      });
    }

    add.addEventListener('click', function(e){
      e.preventDefault();
      var value = topic.value.trim();
      if(!value){
        alert('Digite o nome da aula ou conteúdo.');
        return;
      }
      var base = date.value || new Date().toISOString().slice(0,10);
      var intervals = [['Revisão 1',1], ['Revisão 2',3], ['Revisão 3',7], ['Revisão 4',15], ['Revisão 5',30]];
      var arr = load();
      intervals.forEach(function(item){
        arr.push({topic:value, label:item[0], date:addDays(base, item[1]), done:false});
      });
      save(arr);
      topic.value = '';
      render();
    });

    var clear = $('clearReviews');
    if(clear) clear.addEventListener('click', function(){
      if(confirm('Apagar todas as revisões salvas neste navegador?')){
        save([]);
        render();
      }
    });

    var exp = $('exportReviewsTxt');
    if(exp) exp.addEventListener('click', function(){
      var items = load().sort(function(a,b){ return a.date.localeCompare(b.date); });
      if(!items.length){ alert('Nenhuma revisão para baixar.'); return; }
      var txt = 'Revisão Espaçada Bioguará\\n\\n' + items.map(function(it){
        return it.topic + ' | ' + it.label + ' | ' + fmt(it.date) + ' | ' + (it.done ? 'Concluída' : 'Pendente');
      }).join('\\n');
      downloadText('revisao-espacada-bioguara.txt', txt);
    });

    var pdf = $('printReviewsPdf');
    if(pdf) pdf.addEventListener('click', function(){
      var items = load().sort(function(a,b){ return a.date.localeCompare(b.date); });
      if(!items.length){ alert('Nenhuma revisão para gerar relatório.'); return; }
      var rows = items.map(function(it){
        return '<tr><td>'+escapeHTML(it.topic)+'</td><td>'+escapeHTML(it.label)+'</td><td>'+fmt(it.date)+'</td><td>'+(it.done?'Concluída':'Pendente')+'</td></tr>';
      }).join('');
      abrirRelatorioBioguara('Revisão Espaçada Bioguará', 'Agenda de revisões gerada pelo Método Bioguará', '<section class="report-section"><h2>Revisões programadas</h2><table><thead><tr><th>Conteúdo</th><th>Etapa</th><th>Data</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></section>');
    });

    render();
  }

  function initPlanejador(){
    var out = $('planOutput'), btn = $('generatePlan');
    if(!out || !btn) return;
    var days = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];

    function generate(){
      var minutes = parseInt(($('planMinutes') && $('planMinutes').value) || '60', 10);
      var subjectsValue = ($('planSubjects') && $('planSubjects').value) || '';
      var subjects = subjectsValue.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
      var n = parseInt(($('planDays') && $('planDays').value) || '5', 10);
      if(!subjects.length){ alert('Digite pelo menos uma matéria.'); return; }
      var blocks = minutes >= 60 ? ['Leitura ativa','Questões','Revisão sem olhar'] : ['Leitura ativa','Questões'];
      out.innerHTML = days.slice(0,n).map(function(d, i){
        var subj = subjects[i % subjects.length];
        var blockMin = Math.max(15, Math.floor(minutes / blocks.length));
        return '<div class="planner-day"><h3>'+d+'</h3><strong>'+escapeHTML(subj)+'</strong>' + blocks.map(function(b){ return '<p>'+b+': '+blockMin+' min</p>'; }).join('') + '<span>Total: '+minutes+' min</span></div>';
      }).join('');
    }

    btn.addEventListener('click', function(e){
      e.preventDefault();
      generate();
    });

    var exp = $('exportPlanTxt');
    if(exp) exp.addEventListener('click', function(){
      var content = Array.from(out.querySelectorAll('.planner-day')).map(function(day){ return day.innerText.trim(); }).join('\\n\\n');
      if(!content){ alert('Gere um cronograma primeiro.'); return; }
      downloadText('planejador-estudos-bioguara.txt', 'Planejador de Estudos Bioguará\\n\\n' + content);
    });

    var pdf = $('printPlanPdf');
    if(pdf) pdf.addEventListener('click', function(){
      var cards = Array.from(out.querySelectorAll('.planner-day'));
      if(!cards.length){ alert('Gere um cronograma primeiro.'); return; }
      var sections = cards.map(function(day){
        var lines = day.innerText.trim().split('\\n').filter(Boolean);
        var title = lines.shift() || 'Dia';
        return '<section class="report-section"><h2>'+escapeHTML(title)+'</h2>' + lines.map(function(l){ return '<p>'+escapeHTML(l)+'</p>'; }).join('') + '</section>';
      }).join('');
      abrirRelatorioBioguara('Planejador de Estudos Bioguará', 'Cronograma semanal de estudos', sections);
    });

    generate();
  }

  function initOrganizador(){
    var list = $('orgList'), add = $('addLesson');
    if(!list || !add) return;
    var key = 'bioguaraOrganizador';

    function load(){ return loadJSON(key, []); }
    function save(items){ saveJSON(key, items); }

    function render(){
      var arr = load();
      if(!arr.length){
        list.innerHTML = '<p>Nenhuma aula adicionada ainda.</p>';
        return;
      }
      list.innerHTML = arr.map(function(it, i){
        return '<div class="org-item"><h3>'+escapeHTML(it.lesson)+'</h3><p>'+escapeHTML(it.subject)+'</p><label><input type="checkbox" data-i="'+i+'" data-k="leu" '+(it.leu?'checked':'')+'> Leu</label><label><input type="checkbox" data-i="'+i+'" data-k="copiou" '+(it.copiou?'checked':'')+'> Copiou</label><label><input type="checkbox" data-i="'+i+'" data-k="questoes" '+(it.questoes?'checked':'')+'> Questões</label><label><input type="checkbox" data-i="'+i+'" data-k="revisou" '+(it.revisou?'checked':'')+'> Revisou</label><button type="button" data-i="'+i+'" class="delete-org">Excluir</button></div>';
      }).join('');

      document.querySelectorAll('.org-item input').forEach(function(ch){
        ch.addEventListener('change', function(){
          var a = load();
          a[Number(ch.dataset.i)][ch.dataset.k] = ch.checked;
          save(a);
        });
      });
      document.querySelectorAll('.delete-org').forEach(function(button){
        button.addEventListener('click', function(){
          var a = load();
          a.splice(Number(button.dataset.i), 1);
          save(a);
          render();
        });
      });
    }

    add.addEventListener('click', function(e){
      e.preventDefault();
      var subjectInput = $('orgSubject');
      var lessonInput = $('orgLesson');
      var subject = subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : 'Disciplina';
      var lesson = lessonInput ? lessonInput.value.trim() : '';
      if(!lesson){ alert('Digite o nome da aula.'); return; }
      var arr = load();
      arr.push({subject:subject, lesson:lesson, leu:false, copiou:false, questoes:false, revisou:false});
      save(arr);
      if(lessonInput) lessonInput.value = '';
      render();
    });

    var clear = $('clearOrg');
    if(clear) clear.addEventListener('click', function(){
      if(confirm('Apagar todo o progresso salvo neste navegador?')){
        save([]);
        render();
      }
    });

    var exp = $('exportOrgTxt');
    if(exp) exp.addEventListener('click', function(){
      var a = load();
      if(!a.length){ alert('Nenhuma aula adicionada.'); return; }
      var txt = 'Organizador de Resumos Bioguará\\n\\n' + a.map(function(it){
        return it.subject + ' - ' + it.lesson + '\\nLeu: ' + (it.leu?'sim':'não') + ' | Copiou: ' + (it.copiou?'sim':'não') + ' | Questões: ' + (it.questoes?'sim':'não') + ' | Revisou: ' + (it.revisou?'sim':'não');
      }).join('\\n\\n');
      downloadText('organizador-resumos-bioguara.txt', txt);
    });

    var pdf = $('printOrgPdf');
    if(pdf) pdf.addEventListener('click', function(){
      var a = load();
      if(!a.length){ alert('Nenhuma aula adicionada para gerar relatório.'); return; }
      var sections = a.map(function(it){
        return '<section class="report-section"><h2>'+escapeHTML(it.lesson)+'</h2><p class="meta">Disciplina: '+escapeHTML(it.subject)+'</p><p><span class="checkline">'+(it.leu?'☑':'☐')+' Leu</span><span class="checkline">'+(it.copiou?'☑':'☐')+' Copiou</span><span class="checkline">'+(it.questoes?'☑':'☐')+' Questões</span><span class="checkline">'+(it.revisou?'☑':'☐')+' Revisou</span></p></section>';
      }).join('');
      abrirRelatorioBioguara('Organizador de Resumos Bioguará', 'Progresso de estudo das aulas e resumos', sections);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function(){
    initRevisao();
    initPlanejador();
    initOrganizador();
  });
})();
