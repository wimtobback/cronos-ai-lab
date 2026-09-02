---
title: Request for AI Labs
shortTitle: Labs
icon: lucide:flask-conical
eyebrow: For corporate, partner and academic labs
summary: Already have a lab? We build with corporate, partner and academic labs rather than selling to them.
heroHeadline: The interesting problems are too big for one lab.
heroLead: A growing number of our customers have built their own AI lab, our technology partners run theirs, and the universities around us are doing work that deserves contact with real industrial data. None of those relationships fit a supplier contract. This is the front door for the ones that are genuinely peer-to-peer.
forWho:
  - Enterprise AI labs inside organisations who want a second team on a problem, not a vendor
  - Technology partners building models, infrastructure or tooling we can deploy at real scale
  - Universities and research institutes looking for applied testbeds and industrial data
  - Anyone whose proposal starts with what we would build together rather than what you would sell us
youGet:
  - title: Joint teams on real problems
    body: We put our engineers alongside yours on a live customer challenge, with one roadmap and one definition of done. Shared credit, shared blame, and a system somebody actually depends on at the end.
  - title: Deployment at real scale
    body: For technology partners, a route from early access to production inside the organisations the Cronos Group already works in — with honest feedback about where your product breaks under enterprise conditions.
  - title: Applied testbeds and publication
    body: For research groups, access to industrial data and problems that do not exist in public datasets. We support joint publication, and we will not sit on a result because it is commercially awkward.
  - title: People in both directions
    body: Secondments and residencies that actually run — your researchers embedded with us, our engineers embedded with you, for long enough to matter.
process:
  - title: Introduction
    body: Tell us what your lab works on and what you would want to do together. We reply within five working days, and we say no when there is no genuine overlap.
  - title: Scoping session
    body: A working session between the two teams — not a commercial meeting. We look for a problem that neither lab would take on alone.
  - title: Pilot collaboration
    body: One bounded piece of work, six to twelve weeks, with the intellectual property, publication rights and cost split agreed in writing before it starts.
  - title: Standing relationship
    body: If the pilot works, we set up something continuing — a joint team, a secondment programme, or a multi-year research track.
formTitle: Propose a collaboration
formLead: The strongest proposals name a specific problem rather than a general interest in working together.
formFields:
  - { name: name, label: Your name, type: text, required: true, half: true }
  - { name: email, label: Email, type: email, required: true, half: true }
  - { name: organisation, label: Lab or organisation, type: text, required: true, half: true }
  - { name: website, label: Website, type: url, half: true }
  - name: labType
    label: What kind of lab are you?
    type: select
    required: true
    options: [Corporate or enterprise AI lab, Technology partner, University or research institute, Independent research lab, Something else]
    half: true
  - name: teamSize
    label: How many people in your lab?
    type: select
    options: ["Under 5", "5–15", "15–50", "50+"]
    half: true
  - name: focus
    label: What does your lab work on?
    type: textarea
    required: true
    placeholder: The problems you are actually working on now, not your mission statement.
  - name: proposal
    label: What would we do together?
    type: textarea
    required: true
    placeholder: A specific problem, dataset, product or research question. Concrete beats broad.
  - name: constraints
    label: Anything we should know early?
    type: textarea
    placeholder: Funding model, publication requirements, IP constraints, data sensitivity, existing partnerships.
order: 5
---
