import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  PickerIOS,
  PickerItemIOS,
  Switch,
  DatePickerIOS,
  ScrollView,
} from 'react-native';

// import LoadingView from './lib/components/LoadingView/index.js';

var REQUEST_URL = 'http://lee.local:3000/api/groups/test';
var POST_URL = 'http://lee.local:3000/api/groups/test/transactions';

export default class Billcrush extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          loaded: true,
          group: responseData.group,
          transaction: {
            payer: responseData.group.members[0].id,
            amount: '0.00',
            date: new Date(),
            message: null,
            members: responseData.group.members.map((member) => (
                                                      { id: member.id,
                                                        enabled: true,
                                                        amount: '0.00',
                                                        name: member.name,
                                                        fixed: false,
                                                      }
                                                   )),
          }
        });
      })
      .catch((responseData) => {
        this.setState({loaded: false, message: "Retry connection."});
      })
      .done();
  }

  postData(data) {
    var request = new Request(POST_URL, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Content-Type': 'text/json'
      }),
      body: JSON.stringify(data),
    });

    fetch(request).then((response) => response.json()).then((jsonData) => {
      this.setState({transaction: {...this.state.transaction, amount: '0.00'}});
      alert("Successfully posted your transaction.");
    })
    .catch((responseData) => {
      alert("Error posting data. Try again later.");
    })
    .done();

  }

  setAmountFor(id, amount) {
    var member = this.state.transaction.members.find((m) => (m.id == id));
    var updatedMembers = this.state.transaction.members;
    var updatedMember = member;
    updatedMember.amount = amount
    this.setState({transaction: {...this.state.transaction, members: updatedMembers}});
  }

  toggleMember(id, enabled) {
    var member = this.state.transaction.members.find((m) => (m.id == id));
    var updatedMembers = this.state.transaction.members;
    var updatedMember = member;
    updatedMember.enabled = enabled;
    if (updatedMember.enabled) {
      updatedMember.fixed = false;
    }
    else {
      updatedMember.amount = '0.00';
    }
    this.setState({transaction: {...this.state.transaction, members: updatedMembers}});
  }

  setFixStateFor(id, fixed) {
    var member = this.state.transaction.members.find((m) => (m.id == id));
    var updatedMembers = this.state.transaction.members;
    var updatedMember = member;
    updatedMember.fixed = fixed
    this.setState({transaction: {...this.state.transaction, members: updatedMembers}});
  }

  formatMoney(amount) {
    var floatAmount = parseFloat(amount);
    if (isNaN(floatAmount)) {
      return '0.00';
    }
    else {
      return String(floatAmount.toFixed(2));
    }
  }

  balanceTransaction() {
    var sharingMembers = this.state.transaction.members.filter((m) => ( m.enabled && !m.fixed));
    var nonSharingMembers = this.state.transaction.members.filter((m) => ( !m.enabled || m.fixed));
    var nonSharingAmount = nonSharingMembers.reduce(((memo, member) => memo + parseFloat(member.amount)), 0);
    var sharingTotal = parseFloat(this.state.transaction.amount) - parseFloat(nonSharingAmount);

    sharingMembers.forEach((m, i) => {
      var equalShare = (sharingTotal / sharingMembers.length).toFixed(2);
      var roundingShare = (sharingTotal - equalShare * (sharingMembers.length - 1)).toFixed(2);
      var unluckyIndex = sharingMembers[Math.floor(Math.random() * (sharingMembers.length))].id;

      if (i == unluckyIndex ) {
        this.setAmountFor(m.id, this.formatMoney(roundingShare));
      }
      else {
        this.setAmountFor(m.id, this.formatMoney(equalShare));
      }
    })
  }

  renderLoadingView() {
    return (
      <View style={styles.loader}>
        <Text style={[styles.reload, this.state.message ? false : styles.hidden]} onPress={this.fetchData}>{this.state.message}</Text>
        <Text style={this.state.message ? styles.hidden : false}>Loading group...</Text>
      </View>
    )
  }

  renderGroup() {
    return (
      <ScrollView style={styles.transactionContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.labelBig}>Billcrush: {this.state.group.canonicalized_name}</Text>
        <PickerIOS style={styles.memberPicker}
                   onValueChange={(member) => this.setState({transaction: {...this.state.transaction, payer: member}})}
                   selectedValue={this.state.transaction.payer}>
          {this.state.group.members.map((member) => (
            <PickerItemIOS style={styles.memberPickerItem} key={member.id} value={member.id} label={member.name} />
          ))}
        </PickerIOS>
        <View style={styles.sentenceContainer}>
          <Text style={styles.labelSmall}>paid</Text>
          <Text style={styles.labelPrefix}>$</Text>
          <TextInput style={styles.amountInput}
                      keyboardType='numeric'
                      onFocus={(event) => {
                        if (parseFloat(this.state.transaction.amount) == 0) {
                          this.setState({transaction: {...this.state.transaction, amount: ''}});
                        }
                      }}
                      onBlur={(event) => {
                        if(event.nativeEvent.text == '') {
                          this.setState({transaction: {...this.state.transaction, amount: '0.00'}});
                        }
                        else {
                          this.setState({transaction: {...this.state.transaction, amount: this.formatMoney(event.nativeEvent.text)}});
                        }
                      }}
                      onChange={(event)=>{
                        this.setState({transaction: {...this.state.transaction, amount: event.nativeEvent.text}});
                        this.balanceTransaction();
                      }}
                      value={this.state.transaction.amount}/>
        </View>
        <View style={styles.sentenceContainer}>
          <Text style={styles.labelSmall}>for</Text>
          <TextInput style={styles.descriptionInput}
                      onChange={(event)=>{
                        this.setState({transaction: {...this.state.transaction, description: event.nativeEvent.text}});
                      }}
                      value={this.state.transaction.description}
                      placeholder='description'/>
        </View>
        <Text style={styles.labelSmall}>on</Text>
        <DatePickerIOS
          style={styles.datePicker}
          date={this.state.transaction.date}
          mode="date"
          onDateChange={(date) => {
            this.setState({transaction: {...this.state.transaction, date: date}});
          }}
        />
        <Text style={styles.labelSmall}>split between</Text>
        {this.state.transaction.members.map((member) => (
          <View style={styles.sentenceContainer}>
            <Switch style={styles.memberSwitch}
                    value={member.enabled}
                    onValueChange={(value) => {
                      this.toggleMember(member.id, !member.enabled);
                      this.balanceTransaction();
                    }}/>
            <Text style={styles.labelSmall}>{member.name}</Text>
            <Text style={styles.labelPrefix}>$</Text>
            <TextInput style={[styles.amountInput, member.fixed ? styles.memberFixed : false, !member.enabled ? styles.memberDisabled : false]}
                      keyboardType='numeric'
                      editable={member.enabled}
                      onFocus={(event) => {
                        if (parseFloat(member.amount) == 0) {
                          this.setAmountFor(member.id, '');
                        }
                      }}
                      onBlur={(event) => {
                        if(member.amount == '') {
                          this.setAmountFor(member.id, '0.00');
                        }
                        else {
                          this.setAmountFor(member.id, this.formatMoney(member.amount));
                        }
                      }}
                      onChange={(event) => {
                        this.setAmountFor(member.id, event.nativeEvent.text);
                        this.setFixStateFor(member.id, true);
                        this.balanceTransaction();
                      }}
                      value={String(member.amount)}/>
          </View>
        ))}
        <Text style={styles.submitButton} onPress={(event) => {
          alert(JSON.stringify(this.state));
          this.postData({transaction: this.state.transaction})
        }
        }>Submit</Text>
      </ScrollView>
    );
  }

  render() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return this.renderGroup();
  }
}

const styles = StyleSheet.create({
  transactionContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  loader: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
  sentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionInput: {
    height: 40,
    flex: 1,
    textAlign: 'center',
    borderColor: 'blue',
    borderWidth: 1,
    margin: 10,
  },
  amountInput: {
    height: 40,
    width: 100,
    textAlign: 'center',
    borderColor: 'green',
    borderWidth: 1,
    margin: 10,
    flex: 1,
  },
  labelBig: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
    marginTop: 30,
  },
  labelSmall: {
    fontSize: 20,
    margin: 5,
  },
  labelPrefix: {
    fontSize: 30,
    marginLeft: 5,
    marginRight: -5,
    color: 'green',
  },
  memberPicker: {
    flex: 1,
  },
  memberPickerItem: {
  },
  memberSwitch: {
    margin: 10,
  },
  owingMember: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    fontSize: 40,
    backgroundColor: 'blue',
    borderRadius: 10,
    color: 'white',
    textAlign: 'center',
    padding: 5,
    margin: 20,
  },
  memberDisabled: {
    color: '#ddd',
    backgroundColor: '#ddd',
  },
  memberFixed: {
    backgroundColor: '#ddd',
  },
  datePicker: {
    flex: 1,
  },
  loader: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
  reload: {
    backgroundColor: 'blue',
    color: 'white',
    fontSize: 20,
    padding: 5,
  },
  hidden: {
    opacity: 0,
  },
});
