const allTypes=[
    'browsertime.run',
    'browsertime.pageSummary',
    'browsertime.har',
    'webpagetest.run',
    'webpagetest.pageSummary',
    'gpsi.data',
    'gpsi.pageSummary',
    'pagexray.run',
    'pagexray.pageSummary',
    'coach.run',
    'coach.pageSummary',
    'assets.aggregate',
    'domains.summary',
    'webpagetest.summary',
    'coach.summary',
    'pagexray.summary',
    'browsertime.summary'
];

const summaryTypes=allTypes.filter(x=>x.includes('ummary'));

module.exports={allTypes,summaryTypes}