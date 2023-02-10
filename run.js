import fetch from 'node-fetch';

let args = process.argv.slice(2);
let accountIdentifier = args[0];
let apiKey = args[1];
let projectFilter = ["Account_Notification_Plugin", "GitOps"];
let dateEndTs = new Date();
let dateStartTs = new Date(dateEndTs.getTime() - 60*60*1000); // one hour ago

let pipelineSuccessStatuses = ["Success"];
let pipelineFailureStatuses = ["Failed", "Errored", "IgnoreFailed", "Expired", "Aborted", "Discontinuing", "ApprovalRejected", "AbortedByFreeze", "APPROVAL_REJECTED"];
let pipelineOtherStatuses   = ["Running", "AsyncWaiting", "TaskWaiting", "TimedWaiting", "NotStarted", "Queued", "Paused", "ResourceWaiting", "InterventionWaiting", "ApprovalWaiting", "WaitStepRunning", "Suspended", "Skipped", "Pausing", "InputWaiting", "NOT_STARTED", "INTERVENTION_WAITING", "APPROVAL_WAITING", "Waiting"];

let resourceAuditActions = ["CREATE"];
let userAuditActions = ["LOGIN", "LOGIN2FA", "UNSUCCESSFUL_LOGIN", "INVITE"];

if (!accountIdentifier || apiKey == "") {
    console.log("Missing required inputs");
    process.exit(-1)
}

// PROJECTS

const query = new URLSearchParams({
  accountIdentifier: accountIdentifier
}).toString();

const resp = await fetch(
  `https://app.harness.io/gateway/ng/api/projects/list?${query}`,
  {
    method: 'GET',
    headers: {
      'x-api-key': apiKey
    }
  }
);
if (!resp.ok) {
  console.log(response)
  process.exit(-1)
}
/**
 * Projects:
 * 
 * [{
    project: {
      orgIdentifier: 'CI_Training',
      identifier: 'wyattmunson',
      name: 'wyatt_munson',
      color: '#0063F7',
      modules: [Array],
      description: 'Harness Project created via Terraform',
      tags: [Object]
    },
    createdAt: 1674759990168,
    lastModifiedAt: 1674759990168
  }]
 */


let data = await resp.json();

console.info("Found %d projects.", data.data.content.length);

let projects = data.data.content;

projects.forEach(async project => {

  console.info(" - Project:", project.project.identifier);

  if (!projectFilter.includes(project.project.identifier)) {
    console.debug(" -- Skipping project");
    return;
  }

  let recentPipelineExecutions = await fetchRecentPipelineExecutions(project.project.orgIdentifier, project.project.identifier);

  console.info(" -- Found %d pipeline executions", recentPipelineExecutions.totalElements);
  
  // build pipeline notifications
  let pipelineNotifications = {};

  recentPipelineExecutions.content.forEach(async pipelineExecution => {

    if (pipelineNotifications[pipelineExecution.pipelineIdentifier] == undefined) {
      pipelineNotifications[pipelineExecution.pipelineIdentifier] = {
        "url": "https://app.harness.io/ng/#/account/" + accountIdentifier + "/home/orgs/" + project.project.orgIdentifier + "/projects/" + project.project.identifier + "/pipelines/" + pipelineExecution.pipelineIdentifier + "/executions?storeType=INLINE",
        "triggeredBy": pipelineExecution.executionTriggerInfo.triggeredBy.identifier,
        "successCount": 0,
        "failCount": 0,
        "otherCount": 0
      };
    }

    // increment status counters
    if (pipelineSuccessStatuses.includes(pipelineExecution.status)) {
      pipelineNotifications[pipelineExecution.pipelineIdentifier]["successCount"]++;
    } else if (pipelineFailureStatuses.includes(pipelineExecution.status)) {
      pipelineNotifications[pipelineExecution.pipelineIdentifier]["failCount"]++;
    } else {
      pipelineNotifications[pipelineExecution.pipelineIdentifier]["otherCount"]++;
    }
  });

  console.log(pipelineNotifications);

});

// RESOURCE AUDIT

let resourceAuditEvents = await fetchRecentAuditHistory();

console.info(" -- Found %d resource audit events", resourceAuditEvents.totalItems);
  
// build pipeline notifications
let resourceAuditNotifications = [];

resourceAuditEvents.content.forEach(async resourceEvent => {

  /**
   * FORMAT:
   * {
  auditId: '63e5815e0f842e39a47c71be',
  resourceScope: {
    accountIdentifier: '6C9qo5gJSdK7gb-ngOtpCw',
    orgIdentifier: 'default',
    projectIdentifier: 'Account_Notification_Plugin'
  },
  httpRequestInfo: { requestMethod: 'POST' },
  requestMetadata: { clientIP: '98.59.36.166' },
  timestamp: 1675985245280,
  authenticationInfo: {
    principal: { type: 'USER', identifier: 'konr.ness@harness.io' },
    labels: {
      userId: 'FA2HiMNoTCengvhsFUBFzQ',
      username: 'konr.ness@harness.io'
    }
  },
  module: 'CORE',
  resource: {
    type: 'VARIABLE',
    identifier: 'Test_1',
    labels: { resourceName: 'Test 1' }
  },
  action: 'CREATE'
}

   * 
   */

  resourceAuditNotifications.push({
    "user": resourceEvent.authenticationInfo.principal.identifier,
    "action": resourceEvent.action,
    "resourceType": resourceEvent.resource.type,
    "resourceId": resourceEvent.resource.identifier
  });

});

console.log(resourceAuditNotifications);



// USER AUDIT


async function fetchRecentPipelineExecutions(orgIdentifier, projectIdentifier) {

    const query = new URLSearchParams({
      accountIdentifier: accountIdentifier,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: '0',
      size: '20',
      sort: 'startTs%2CDESC',
      //filterIdentifier: 'string'
    }).toString();

    const body = {"timeRange":{"startTime":dateStartTs.getTime(),"endTime":dateEndTs.getTime()},"filterType":"PipelineExecution"};
  
    const resp = await fetch(
      `https://app.harness.io/gateway/pipeline/api/pipelines/execution/summary?${query}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(body)
      }
    );

    const data = await resp.json();
    return data.data;
}


async function fetchRecentAuditHistory() {

  const query = new URLSearchParams({
    accountIdentifier: accountIdentifier,
    page: '0',
    size: '50',
    sort: 'startTs%2CDESC'
  }).toString();

  const body = {
    "startTime":dateStartTs.getTime(),
    "endTime":dateEndTs.getTime(),
    "filterType":"Audit",
    // If in the future we filter on resource types, 
    // split resourceAuditActions and userAuditActions into two separate queries
    "actions": resourceAuditActions.concat(userAuditActions) 
  };

  const resp = await fetch(
    `https://app.harness.io/gateway/audit/api/audits/list?${query}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(body)
    }
  );

  const data = await resp.json();
  return data.data;
}

