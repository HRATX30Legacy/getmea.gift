import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import BuyGiftModal from './BuyGiftModal';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
  },
};

/**
 * A simple example of a scrollable `GridList` containing a [Subheader](/#/components/subheader).
 */
class WishlistEntryGridList extends React.Component {
  constructor(props) {
    super(props);
    this.giftModal = this.giftModal.bind(this);
  }

  giftModal(tile, index) {
    return (<BuyGiftModal
      primary={'#ff5656'}
      item={tile}
      index={index}
      getUserData={this.props.userData.bind(this)}
      isListOwner={this.props.isListOwner}
      userData={this.props.userData}
    />)
  }
  
  render() {
    return (
      <div style={styles.root}>
        <GridList
          cellHeight={180}
          style={styles.gridList}
        >
          {this.props.list.map((tile, index) => (
              <GridTile
                key={index}
                title={tile.title}
                subtitle={<span><b>{tile.comments}</b></span>}
                actionIcon={<IconButton><StarBorder color="white" onClick={() => {this.props.purchase(tile)}}/></IconButton>}
              >
                  <img src={tile.image_url} />
                  {/* {!tile.purchased && this.giftModal(tile, index)} */}
              </GridTile>
              
          ))}
          =
        </GridList>
        
      </div>
    );
  }
}

export default WishlistEntryGridList;