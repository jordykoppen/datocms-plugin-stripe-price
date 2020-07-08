import React, { Component } from 'react';
import PropTypes from 'prop-types';

import connectToDatoCms from './connectToDatoCms';

@connectToDatoCms(plugin => ({
  developmentMode: plugin.parameters.global.developmentMode,
  stripeSecret: plugin.parameters.global.stripeApiKey,
  fieldValue: plugin.getFieldValue(plugin.fieldPath),
}))

export default class Main extends Component {
  static propTypes = {
    stripeSecret: PropTypes.string.isRequired,
    plugin: PropTypes.any.isRequired,
    fieldValue: PropTypes.any.isRequired,
  }

  state = {
    price: undefined,
    value: '',
    errror: undefined,
  }


  componentDidMount() {
    const { fieldValue } = this.props;

    if (fieldValue) {
      const data = JSON.parse(fieldValue);

      this.setState({
        value: data.id,
      });
    }
  }

  fetchPriceForId(id) {
    const { setFieldValue, fieldPath } = this.props.plugin;

    if (id) {
      const { stripeSecret } = this.props;
      fetch(`https://api.stripe.com/v1/prices/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
        },
      }).then(x => x.json()).then((data) => {
        this.setState({ error: undefined });

        setFieldValue(fieldPath, JSON.stringify(data));
      }).catch((error) => {
        this.setState({ error });
      });
    }
  }

  render() {
    const { value, error } = this.state;

    return (
      <div>
        <input type="text" value={value} placeholder="Price ID" onBlur={() => this.fetchPriceForId(value)} onChange={evt => this.setState({ value: evt.target.value })} />
        { error && <span style={{ color: 'red' }}>Something went wrong. Please check if the supplied ID is correct</span> }
      </div>
    );
  }
}
