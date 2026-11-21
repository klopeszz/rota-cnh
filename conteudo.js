const topics = [
  ['sinalizacao','Sinalização','◇',[
    ['Como interpretar a via','A sinalização vertical usa placas. A horizontal usa faixas, setas e outras marcas no pavimento. Semáforos controlam o fluxo com luzes. Cones, balizadores e barreiras ajudam a orientar ou isolar áreas, inclusive em obras.'],
    ['Placas e marcas','Regulamentação estabelece obrigações, proibições ou restrições. Advertência avisa sobre riscos. Indicação orienta sobre destinos, serviços e trajetos. Linhas amarelas separam geralmente fluxos opostos e brancas separam geralmente fluxos no mesmo sentido. Uma linha longitudinal contínua de divisão de fluxos impede sua transposição.'],
    ['Hierarquia e situações especiais','Ordens do agente prevalecem sobre sinais e normas. A indicação do semáforo prevalece sobre os demais sinais, que prevalecem sobre as normas gerais. Aproveite a sinalização cicloviária e observe cruzamentos com ferrovia. Em obras, adapte a condução à sinalização temporária.']
  ]],
  ['infracoes','Infrações e crimes','§',[
    ['Infrações e consequências','O CTB classifica infrações em leves, médias, graves e gravíssimas, com 3, 4, 5 e 7 pontos respectivamente quando há pontuação aplicável. Multa e suspensão são exemplos de penalidades. Retenção e remoção são medidas administrativas, com finalidades diferentes.'],
    ['Condutas recorrentes','Manusear celular ao dirigir, avançar o vermelho, ultrapassar em local proibido, desrespeitar a prioridade do pedestre e deixar de usar equipamentos obrigatórios são exemplos de condutas previstas no CTB. Motociclistas e passageiros devem usar capacete conforme as regras. Criança menor de 10 anos não pode ser transportada em motocicleta.'],
    ['Crimes e processo administrativo','Conduzir com capacidade psicomotora alterada por álcool ou outra substância psicoativa pode constituir crime. Homicídio e lesão corporal culposos na direção também têm previsão no CTB. Ao receber uma notificação, confira o fato, o prazo, a forma de defesa e eventual indicação do condutor.']
  ]],
  ['circulacao','Circulação e conduta','↗',[
    ['Preferência e posicionamento','Em cruzamento sem sinalização, tem prioridade quem circula pela rodovia quando somente um fluxo vem dela, depois quem já está na rotatória quando esse for o caso. Nas demais situações, a preferência é do veículo que vem pela direita. Circule pela direita e respeite a destinação das faixas.'],
    ['Conversões e ultrapassagens','Antes de mudar de faixa ou virar, avalie o entorno, sinalize com antecedência e confira pontos cegos. A ultrapassagem é feita pela esquerda, salvo quando o veículo à frente sinaliza que vai entrar à esquerda. Sempre confirme a visibilidade, o espaço e a permissão da manobra.'],
    ['Convivência com outros usuários','Dê prioridade a pedestres nas hipóteses previstas no CTB. Quem já iniciou a travessia tem preferência para concluí-la, mesmo se o sinal abrir para os veículos. Ao passar ou ultrapassar bicicleta, mantenha ao menos 1,5 metro de distância lateral.']
  ]],
  ['defensiva','Direção defensiva','◎',[
    ['Antecipar riscos','Direção defensiva combina conhecimento, atenção, previsão, decisão segura, habilidade e autocontrole. A abordagem Sistema Seguro considera que pessoas erram e propõe repartir a responsabilidade pela segurança entre usuários, veículos, vias e gestão pública.'],
    ['Velocidade, visibilidade e clima','Mantenha distância suficiente para perceber e reagir. A distância de parada inclui a percorrida durante a reação e a de frenagem. Chuva, baixa visibilidade, pista ruim e pneus desgastados exigem margem maior. Se houver aquaplanagem, alivie o acelerador e evite frenagem ou giros bruscos.'],
    ['Condições do condutor e do veículo','Pare em local seguro quando sentir sono. Celular, estresse, álcool e medicamentos que afetam a atenção aumentam o risco. Confira pneus, luzes, freios e visibilidade antes de rodar. Ajuste banco e espelhos e visualize os pontos cegos antes de manobrar.']
  ]],
  ['socorros','Primeiros socorros','+',[
    ['Proteger e acionar ajuda','Em um sinistro, proteja-se, sinalize o local com segurança e ligue para o SAMU (192) ou os Bombeiros (193), conforme a situação. Informe endereço, referência, número aproximado de vítimas e riscos observados. Siga as orientações do atendimento.'],
    ['Aguardar com segurança','Evite movimentar vítimas ou retirar o capacete de um motociclista. Informe ao atendimento se houver risco iminente, como fogo, e siga suas instruções. Evite dar alimentos, líquidos ou medicamentos. Em caso de inconsciência ou sangramento, relate imediatamente o que vê ao atendente.']
  ]],
  ['ambiente','Meio ambiente e cidadania','♧',[
    ['Reduzir impactos','Manutenção preventiva, pneus calibrados conforme o fabricante e acelerações suaves ajudam a reduzir consumo e emissões. A buzina deve ter uso breve nas situações previstas no CTB. Óleo, pneus e baterias exigem descarte em locais adequados.'],
    ['Mobilidade e convivência','Caminhar, pedalar, compartilhar viagens e usar transporte coletivo podem reduzir emissões e ocupação das vias. Respeitar a acessibilidade, as vagas reservadas e a prioridade de quem está mais exposto contribui para uma circulação segura.']
  ]]
];

// Em cada linha, a primeira opção é a correta. A interface embaralha as alternativas.
const bank = {
  sinalizacao: [
    ['O que uma placa de regulamentação comunica?','Uma obrigação, proibição ou restrição','Somente um destino','A quilometragem da rodovia','Uma opção de trajeto','Placas de regulamentação estabelecem condições obrigatórias para o uso da via.'],
    ['O semáforo está verde, mas um agente manda parar. Qual ordem seguir?','A do agente','A do semáforo','A do veículo à frente','A da marca no chão','O art. 89 do CTB dá precedência às ordens do agente.'],
    ['Setas desenhadas no pavimento são exemplos de quê?','Sinalização horizontal','Sinalização vertical','Sinalização sonora','Sinalização gestual','Marcas e inscrições pintadas na pista pertencem à sinalização horizontal.'],
    ['Qual a função de uma placa que avisa sobre uma curva acentuada?','Advertir sobre um risco à frente','Definir o sentido obrigatório','Autorizar a ultrapassagem','Indicar um serviço','Sinais de advertência antecipam condições que exigem atenção.'],
    ['Qual a função da linha amarela que separa dois sentidos numa pista simples?','Separar fluxos opostos','Mostrar vagas privativas','Separar faixas no mesmo sentido','Indicar um ponto de ônibus','Na divisão de fluxos, o amarelo identifica sentidos de circulação opostos.'],
    ['O que fazer diante de uma linha contínua no seu lado que separa fluxos opostos?','Permanecer na faixa sem cruzar a linha','Cruzar se o veículo da frente estiver lento','Cruzar ao ligar a seta','Cruzar se não houver radar','A linha contínua de divisão dos fluxos proíbe a transposição no lado em que está contínua.'],
    ['Em uma obra, qual recurso pode canalizar temporariamente o tráfego?','Cones de sinalização','Pisca-alerta de todo veículo em circulação','Espelhos do condutor','Buzina dos veículos','Cones são dispositivos auxiliares e delimitam desvios ou áreas de trabalho.']
  ],
  infracoes: [
    ['Qual é a pontuação de uma infração grave quando há registro de pontos?','5 pontos','3 pontos','4 pontos','7 pontos','O CTB prevê 3, 4, 5 e 7 pontos para leve, média, grave e gravíssima.'],
    ['Segurar ou manusear celular enquanto dirige caracteriza infração de qual natureza?','Gravíssima','Grave','Média','Leve','O parágrafo único do art. 252 do CTB enquadra essa conduta como gravíssima.'],
    ['Qual opção é uma medida administrativa?','Remoção do veículo','Multa','Suspensão do direito de dirigir','Advertência por escrito','Remoção é medida administrativa. As demais opções são exemplos de penalidades.'],
    ['Uma criança de 8 anos pode ser passageira de motocicleta?','Não, mesmo com capacete','Sim, com capacete','Sim, em trajetos curtos','Sim, com autorização dos pais','O art. 244 do CTB proíbe transportar criança menor de 10 anos em motocicleta.'],
    ['O que fazer ao receber uma notificação de autuação?','Verificar os dados da autuação e os prazos aplicáveis','Aguardar o prazo acabar para indicar o condutor','Ignorar se a notificação não foi entregue pelo agente','Apresentar defesa sem conferir o órgão responsável','A notificação traz dados e orientações para defesa e eventual indicação do condutor.'],
    ['Dirigir com capacidade psicomotora alterada pelo álcool pode configurar o quê?','Crime de trânsito','Somente advertência','Infração leve em qualquer caso','Apenas irregularidade documental','O art. 306 do CTB prevê crime nessas condições. Também podem existir consequências administrativas.'],
    ['Avançar o sinal vermelho, sem exceção de conversão sinalizada, é uma infração de qual natureza?','Gravíssima','Grave','Média','Leve','O art. 208 do CTB classifica o avanço indevido do sinal vermelho como gravíssimo.']
  ],
  circulacao: [
    ['Num cruzamento comum sem sinalização, sem rotatória nem rodovia, quem tem preferência?','Quem vem pela direita','Quem chega pela esquerda','Quem está mais rápido','O veículo maior','Nas situações residuais de cruzamento sem sinalização, vale a preferência do veículo que vem pela direita.'],
    ['Quem tem preferência numa rotatória sem sinalização em contrário?','Quem já circula por ela','Quem está entrando pela direita','Quem buzina primeiro','Quem tem o maior veículo','O fluxo interno tem prioridade. Aguarde uma brecha segura para ingressar.'],
    ['Qual distância lateral mínima deve ser mantida ao passar ou ultrapassar uma bicicleta?','1,5 metro','0,5 metro','1 metro','Não há distância mínima','O art. 201 do CTB exige distância lateral de 1,5 metro.'],
    ['O sinal abriu para os carros, mas um pedestre ainda termina de cruzar. O que fazer?','Aguardar que ele conclua a travessia','Avançar devagar diante dele','Buzinar para apressá-lo','Desviar pela contramão','O art. 70 preserva a preferência do pedestre que ainda não completou a travessia.'],
    ['Como preparar uma mudança de faixa?','Checar o entorno e sinalizar com antecedência','Sinalizar apenas depois de entrar','Olhar só pelo para-brisa','Acelerar e esperar que os outros desviem','O condutor deve verificar se a manobra é segura e indicar a intenção antes de executá-la.'],
    ['Qual é o lado usual para ultrapassar?','Esquerdo','Direito','Acostamento','Qualquer lado sem seta','A regra geral é ultrapassar pela esquerda. Há exceção quando o veículo à frente indica conversão à esquerda.'],
    ['Em cruzamento sem sinalização, apenas um dos fluxos vem de rodovia. Quem tem preferência?','Quem circula pela rodovia','Quem vem da via lateral','Quem estiver à esquerda','Quem tiver menor velocidade','Quando só um fluxo é proveniente de rodovia, a preferência é de quem circula por ela.']
  ],
  defensiva: [
    ['O que fazer quando começa a chover?','Aumentar a distância de seguimento e adequar a velocidade','Reduzir a distância para enxergar melhor','Frear com força em toda curva','Manter a velocidade independentemente da pista','A chuva reduz a aderência e pode comprometer a visibilidade, aumentando a margem necessária para reagir.'],
    ['O que compõe a distância de parada?','Distâncias de reação e de frenagem','Somente a distância de frenagem','Somente a distância de reação','A distância até o próximo sinal','O veículo continua avançando durante a reação e também após o início da frenagem.'],
    ['O que fazer ao sentir sono ao volante?','Parar em local seguro para descansar','Aumentar o volume da música e seguir','Acelerar para chegar antes','Dirigir mais perto de outro veículo','A fadiga diminui a atenção e a capacidade de reação. Pare em local seguro.'],
    ['Como reduzir o risco de colidir ao mudar de faixa?','Verificar os pontos cegos além dos retrovisores','Confiar apenas nos espelhos','Manobrar sem seta se a pista parecer vazia','Buzinar e entrar rapidamente','Os retrovisores não cobrem todos os ângulos. Complete a observação antes de mudar de faixa.'],
    ['Qual é uma reação adequada se os pneus começarem a aquaplanar?','Aliviar o acelerador e evitar movimentos bruscos','Pisar a fundo no freio imediatamente','Girar o volante bruscamente','Acelerar para recuperar aderência','Com pouca aderência, movimentos suaves ajudam a manter o controle até o pneu voltar a tocar o piso.'],
    ['O que significa adequar a velocidade à via?','Considerar a visibilidade, a aderência e o movimento','Dirigir sempre no máximo permitido','Seguir a velocidade do veículo mais rápido','Reduzir apenas diante de radares','O limite é um teto. Em condições desfavoráveis, dirigir mais devagar pode ser necessário.'],
    ['Qual situação exemplifica a abordagem Sistema Seguro?','Projetar vias e veículos para reduzir a gravidade dos erros','Atribuir toda a segurança a quem dirige','Eliminar toda sinalização para evitar distração','Contar somente com punições depois dos sinistros','O sistema deve prever erros humanos e reduzir o risco de mortes e lesões graves.']
  ],
  socorros: [
    ['Qual número aciona o SAMU?','192','190','191','199','O SAMU atende urgências médicas pelo 192.'],
    ['Que informação ajuda o atendimento a chegar ao local?','Localização e ponto de referência','Cor dos documentos','Marca dos pneus','Nome da seguradora','Endereço e referências ajudam a equipe a localizar o sinistro. Informe também vítimas e riscos.'],
    ['Diante de uma vítima com capacete, qual é a conduta inicial do leigo?','Evitar retirar o capacete e seguir a orientação do atendimento','Puxar o capacete de imediato','Levantar a vítima para soltar o capacete','Afrouxar o capacete girando o pescoço','Mexer na cabeça ou no pescoço pode agravar lesões. Acione a equipe e siga suas orientações.'],
    ['É indicado dar água a uma vítima enquanto aguarda socorro?','Não, aguarde orientação profissional','Sim, se ela pedir','Sim, se o dia estiver quente','Sim, sempre que estiver consciente','Líquidos por via oral podem trazer riscos. Aguarde orientação do atendimento.'],
    ['Como prevenir um novo sinistro no local?','Sinalizar quando for seguro, sem se expor ao tráfego','Parar no meio da pista para orientar','Ficar entre os veículos e o fluxo','Estender objetos sem visibilidade','Antes de agir, avalie o risco para quem socorre e para quem ainda circula na via.'],
    ['Qual número aciona o Corpo de Bombeiros?','193','192','190','191','O 193 é o número dos Bombeiros, serviço que atende resgates e incêndios.'],
    ['Durante a ligação, a vítima perde a consciência. O que fazer?','Avisar imediatamente ao atendente e seguir as instruções','Encerrar a ligação para oferecê-la água','Colocá-la sentada puxando os braços','Esperar a equipe chegar para comunicar','Informe imediatamente qualquer mudança importante para receber orientação adequada.']
  ],
  ambiente: [
    ['O que contribui para reduzir consumo de combustível?','Calibrar os pneus e acelerar de forma suave','Acelerar e frear repetidamente','Rodar com pneus abaixo da pressão recomendada','Manter o motor acelerado nas paradas','Manutenção e condução suave reduzem desperdício de energia.'],
    ['Qual é o destino adequado para óleo lubrificante usado?','Um ponto autorizado de recebimento','O bueiro','O solo de terreno vazio','A pia','A coleta adequada evita contaminação da água e do solo.'],
    ['Qual alternativa representa uma atitude de cidadania?','Manter livres as rampas e vagas reservadas','Parar na rampa por poucos minutos','Usar a vaga reservada quando o trânsito estiver calmo','Ocupar a faixa de pedestres ao esperar o sinal','Rampas e vagas reservadas garantem acesso e autonomia a quem precisa delas.'],
    ['Qual prática pode reduzir o número de carros circulando para transportar as mesmas pessoas?','Compartilhar viagens','Usar um carro para cada passageiro','Aumentar o tempo de motor ligado','Circular por rotas mais longas','Compartilhar viagens transporta mais pessoas em cada veículo.'],
    ['Como usar a buzina em uma advertência necessária para evitar sinistro?','Com toque breve','Com toque contínuo até o perigo passar','Em toques longos repetidos','Acompanhada sempre de aceleração','O CTB prevê toque breve para advertências necessárias, limitando ruído e uso indevido.'],
    ['O que fazer com baterias automotivas usadas?','Entregar em local de recebimento adequado','Colocar no lixo doméstico','Desmontar na calçada','Deixar próximo a um córrego','A destinação adequada reduz o risco de vazamento de substâncias nocivas.'],
    ['Que revisão ajuda a evitar excesso de emissões?','Manutenção preventiva conforme o fabricante','Retirada de componentes do escapamento','Revisão apenas quando o veículo parar','Lavagem da carroceria para substituir a revisão','A manutenção preventiva ajuda o conjunto do motor e do controle de emissões a funcionar corretamente.']
  ]
};
