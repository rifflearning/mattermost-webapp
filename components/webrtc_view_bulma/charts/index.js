import mediator from './mm.coffee';

const MM = mediator.MeetingMediator;

class Mediator
{
    // COPIED FROM ORIGINAL RHYTHM-RTC PROJECT
    // with some minor modifications

    constructor(app, participants, user, roomName, userName, peerColors, riffIds, localId)
    {
        console.log("Mediator initial state:", participants, user, roomName, userName);

        this.mm = null;
        this.mm_width = 200;
        this.mm_height = 200;
        this.app = app;
        this.user = user;
        this.roomName = roomName;
        this.roomUsers = participants;
        this.userName = userName;
        this.peerColors = peerColors;
        this.riffIds = riffIds;
        this.localId = localId;

        // if (!elementIsEmpty('#meeting-mediator')) {
        //   console.log("not starting a second MM...");
        //   return;
        // }

        this.turns = this.app.service('turns');
        console.log('>> Starting meeting mediator...');
        console.log('MM participants:', this.roomUsers);
        console.log("meeting mediator:", MM);
        this.mm = new MM({participants: this.roomUsers,
                          transitions: 0,
                          turns: [],
                          names: []},
                         [this.user],
                         this.mm_width,
                         this.mm_height,
                         this.peerColors,
                         this.riffIds,
                         this.localId);
        this.mm.render('#meeting-mediator');

        this.maybe_update_mm_turns = this.maybe_update_mm_turns.bind(this);
        this.turns.on("updated", this.maybe_update_mm_turns);

        this.handle_participantEvent_created = this.handle_participantEvent_created.bind(this);
        //console.log("starting listening for participants");
        //this.app.service('participantEvents').on('created', this.handle_participantEvent_created);

        this.start_meeting_listener();
    }

    // just sums up values of the turns object.
    get_total_transitions(turns)
    {
        return Object.values(turns).reduce((total, curval) => total + curval, 0);
    }

    // transform to the right data to send to chart
    transform_turns(participants, turns)
    {
        console.log("transforming turns:", turns);
        console.log("participants: ", participants);
        // filter out turns not by present participants
        var filtered_turns = turns.filter(turn => participants.includes(turn.participant));
        return filtered_turns;
    }

    // update MM turns if it matches this hangout.
    //
    // example:
    //   data:
    //     participants:
    //       - "Mike"
    //       - "Beth"
    //     transitions: 2
    //     turns:
    //       -
    //         _id: "5b183d0d1af76300111c871d"
    //         participant: "Beth"
    //         turns: 0.5294117647058824
    //       -
    //         _id: "5b183d0d1af76300111c871c"
    //         participant: "Mike"
    //         turns: 0.47058823529411764
    maybe_update_mm_turns(data)
    {
        console.log("mm data turns:", data);

        if (data.room === this.roomName && this.mm.data.participants.length > 1)
        {
            this.mm.updateData({ participants: this.roomUsers,
                                 transitions: data.transitions,
                                 turns: this.transform_turns(this.roomUsers, data.turns) });
        }
        else
        {
            // wrong room, or not enough participants
            //console.log('charts.maybe_update_mm_turns: wrong room, or not enough participants',
            //             { room: data.room, expectedRoom: this.roomName, NumParticipants: this.mm.data.participants.length });
        }
    }

    // update MM participants if it matches this hangout.
    // removes the local participants from the list.
    maybe_update_mm_participants()
    {
        console.log('charts.maybe_update_mm_participants:...');
        // if there's only one person in the room, we want the ball to be at the center.
        // i think this should be handled by the viz code, but it's not and i
        // don't really want to modify it
        let newTurns = this.roomUsers.length > 1 ? this.mm.data.turns : [];
        this.mm.updateData({ participants: this.roomUsers.slice(),
                             transitions: this.mm.data.transitions,
                             turns: newTurns.slice() });
    }

    update_users(users)
    {
        console.log("charts.update_users:", { oldUsers: this.roomUsers, newUsers: users });
        this.roomUsers = users.slice();
        this.maybe_update_mm_participants();
    }

    handle_participantEvent_created(obj)
    {
        console.log("got a new participant event:", obj);
        console.log("roomname:", this.roomName);
        if (obj.room === this.roomName)
        {
            this.mm.updateData({ participants: obj.participants,
                                 transitions: this.mm.data.transitions,
                                 turns: this.mm.data.turns });
        }
    }

    start_meeting_listener() {
        console.log("starting to listen for meeting changes");
        var meetings = this.app.service('meetings');
        meetings.on('patched', function (obj) {
            console.log("meeting got updated:", obj);
            console.log("roomname:", this.roomName);
            if (obj.room === this.roomName) {
                console.log("room matches... updating meeting mediator")
                this.mm.updateData({
                    participants: this.roomUsers,
                    transitions: this.mm.data.transitions,
                    turns: this.mm.data.turns
                });
            }
        }.bind(this));
    }

}

function elementIsEmpty(selector)
{
    let element = document.querySelector(selector);
    if (element === null)
        throw new Error(`selector: '${selector}' did not reference any element in the document`);

    return element.childElementCount === 0;
}

export default Mediator
