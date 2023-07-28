{{> cards/card_component componentName='faqcards' }}
class faqcardsCardComponent extends BaseCard['faqcards'] {
  constructor(config = {}, systemConfig = {}) {
    super(config, systemConfig);
  }
  dataForRender(profile) {
    const linkTarget = AnswersExperience.runtimeConfig.get('linkTarget') || '_top';
    return {
      title: profile.question || profile.name, // The header text of the card
      details: profile.answer ? ANSWERS.formatRichText(profile.answer, "answer", linkTarget) : null, // The text in the body of the card
      sExpanded: false, // Whether the accordion is expanded on page load
      CTA1: {
        label: profile.c_cTAShowMore ? profile.c_cTAShowMore.label : 'Show More', // The CTA's label
        url: Formatter.generateCTAFieldTypeLink(profile.c_cTAShowMore), // The URL a user will be directed to when clicking
        target: linkTarget, // Where the new URL will be opened. To open in a new tab use '_blank'
        eventType: 'CTA_CLICK', // Type of Analytics event fired when clicking the CTA
        eventOptions: this.addDefaultEventOptions({ /* Add additional options here */ }),
      },
      CTA2: {
        label: profile.c_secondaryCTA ? profile.c_secondaryCTA.label : null,
        url: Formatter.generateCTAFieldTypeLink(profile.c_secondaryCTA),
        target: linkTarget,
        eventType: 'CTA_CLICK',
        eventOptions: this.addDefaultEventOptions({ /* Add additional options here */ }),
      },
      feedback: false, // Shows thumbs up/down buttons to provide feedback on the result card
      feedbackTextOnSubmission: 'Thanks!', // Text to display after a thumbs up/down is clicked
      positiveFeedbackSrText: 'This answered my question', // Screen reader only text for thumbs-up
      negativeFeedbackSrText: 'This did not answer my question' // Screen reader only text for thumbs-down
    };
  }
  onMount() {
    const self = this;
    const accordionToggleSelector = '.js-HitchhikerFaqAccordion-toggle';
    const accordionContentSelector = '.js-HitchhikerFaqAccordion-content';
    const accordionExpandedClass = 'HitchhikerFaqAccordion--expanded';
    const accordionCardSelector = '.js-HitchhikerFaqAccordion';
    const accordionToggleEl = self._container.querySelector(accordionToggleSelector);
    if (!accordionToggleEl) {
      return;
    }
    const contentEl = this._container.querySelector(accordionContentSelector);
    let isExpanded = this._container.querySelector(`.${accordionExpandedClass}`);
    const cardEl = this._container.querySelector(accordionCardSelector);
    const linkEls = contentEl.querySelectorAll('a');
    if (this.stayExpanded && this.getState('feedbackSubmitted')) {
      isExpanded = true;
      cardEl.classList.add(accordionExpandedClass);
      accordionToggleEl.setAttribute('aria-expanded', 'true');
      contentEl.setAttribute('aria-hidden', 'false');
    }
    contentEl.style.height = `${isExpanded ? contentEl.scrollHeight : 0}px`;
    this._setLinksInteractivity(linkEls, isExpanded);
    this.stayExpanded = false;
    const thumbSelectorEls = this._container.querySelectorAll('.js-HitchhikerCard-thumbInput');
    if (thumbSelectorEls) {
      thumbSelectorEls.forEach(el => {
        el.addEventListener('click', (e) => {
          this.stayExpanded = true;
        });
      });
    }
    accordionToggleEl.addEventListener('click', function() {
      isExpanded = !isExpanded;
      let parent = this.parentNode;
		if(parent.classList.contains(accordionExpandedClass)){
        isExpanded =  false;
        console.log('true');
    }else{
        document.querySelectorAll(".js-HitchhikerFaqAccordion-toggle").forEach(function(tg) {  
            tg.setAttribute('aria-expanded', 'false');        
      });
      document.querySelectorAll(".js-HitchhikerFaqAccordion-content").forEach(function(ac) {             
            ac.style.height = `0px`;
            ac.setAttribute('aria-hidden', 'true');      
      }); 
      document.querySelectorAll(".js-HitchhikerFaqAccordion").forEach(function(a) { 
            a.classList.remove("HitchhikerFaqAccordion--expanded");   
      }); 
      isExpanded = true;
        console.log('false');
      }
      cardEl.classList.toggle(accordionExpandedClass, isExpanded);
      this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      contentEl.style.height = `${isExpanded ? contentEl.scrollHeight : 0}px`;
      contentEl.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
      self._setLinksInteractivity(linkEls, isExpanded);
      if (self.analyticsReporter) {
        const event = new ANSWERS.AnalyticsEvent(isExpanded ? 'ROW_EXPAND' : 'ROW_COLLAPSE')
        .addOptions({
          verticalKey: self.verticalKey,
          entityId: self.result._raw.id,
          searcher: self._config.isUniversal ? 'UNIVERSAL' : 'VERTICAL'
        });
        self.analyticsReporter.report(event);
      }
    });
  const showExcessDetailsToggleEls = this._container.querySelectorAll('.js-HitchhikerFaqAccordion-detailsToggle');
    const excessDetailsEls = this._container.querySelectorAll('.js-HitchhikerFaqAccordion-detailsText');
    if (showExcessDetailsToggleEls && excessDetailsEls) {
      showExcessDetailsToggleEls.forEach(el =>
        el.addEventListener('click', () => {
          contentEl.style.height = 'auto';
          showExcessDetailsToggleEls.forEach(toggleEl => toggleEl.classList.toggle('js-hidden'));
          excessDetailsEls.forEach(detailsEl => detailsEl.classList.toggle('js-hidden'));
          contentEl.style.height = `${contentEl.scrollHeight}px`;
        })
      );
    }
    super.onMount();
  }
  _setLinksInteractivity(linkEls, isVisible) {
    for (const linkEl of linkEls) {
      linkEl.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      linkEl.setAttribute('tabindex', isVisible ? '0' : '-1');
    }
  }
  static defaultTemplateName (config) {
    return 'cards/faqcards';
  }
}
ANSWERS.registerTemplate(
  'cards/faqcards',
  {{{stringifyPartial (read 'cards/faqcards/template') }}}
);
ANSWERS.registerComponentType(faqcardsCardComponent);