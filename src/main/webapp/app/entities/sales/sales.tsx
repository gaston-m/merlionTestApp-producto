import React, { useState, useEffect } from 'react';
import { api } from '../../shared/util/axios.config'
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate, ICrudGetAllAction } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities, updateEntity } from './sales.reducer';
import { ISales } from 'app/shared/model/sales.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

// Material-ui

import { ButtonGroup } from '@material-ui/core';
import MaterialButton from '@material-ui/core/Button';
import { createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';

import { Color } from '@material-ui/lab/Alert/Alert'
import { Alert } from '@material-ui/lab'

export interface ISalesProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const Sales = (props: ISalesProps) => {

  const successAlert : Color = ('success');
  const errorAlert : Color = ('error')

  const [ alert, setAlert ] = useState({ state: '', status: false, message: ''})

  const { salesList, match, loading } = props;
  const [ currentSalesList, setCurrentSalesList ] = useState([])
  const [ typeSales, setTypeSales ] = useState('IN_CHARGE')

  // Effects

  useEffect(() => {
    props.getEntities();
  }, []);

  const filterSales = () => {
    if(salesList.length) {
      setCurrentSalesList(salesList.filter(sale => sale.state === typeSales))
    }

  }

  useEffect(()=>{
    if(alert.state) {
        setTimeout(
            () => {setAlert({ state: '', status: false, message: ''})
          },
            3000
        )
    }
}, [ alert ])

  useEffect(()=>{
    filterSales()
    if(typeSales) {
      const btns = document.querySelectorAll('.btn-ui')

      btns.forEach(btn => {
        btn.id === typeSales ? btn.classList.add('selected') : btn.classList.remove('selected')
      }); 
    }
  }, [ typeSales, salesList ])

  // Event handlers

  const updateState = async (sale, type) => {
    try {
      let newSale 
      if(type === 'up') {
        const newState = typeSales === 'IN_CHARGE' ? 'SHIPPED' : typeSales === 'SHIPPED' ? 'DELIVERED': 'IN_CHARGE'
        newSale = {
          ...sale,
          state: newState
        }

      } else {
          const newState = typeSales === 'SHIPPED' ? 'IN_CHARGE': 'SHIPPED'
          newSale = {
            ...sale,
            state: newState
          }
      }

     const response = await api('PUT', 'sales', {}, newSale)
      if(response) {
        props.getEntities()
        setAlert({
          state: 'success',
          status: true,
          message: 'Envio exitoso!'
        })
      }
    }
    catch(error) {
      setAlert({
        state: 'error',
        status: true,
        message: 'Ups, no se pudo enviar la venta'
      })
     // console.log(error)
    }
  }

  const _handleChangeTypeSales = type => {
    setTypeSales( type );
  }

/*
  const _handleChangeState = sale => {
    const newState = typeSales === 'IN_CHARGE' ? 'SHIPPED' : typeSales === 'SHIPPED' ? 'DELIVERED': 'IN_CHARGE'
    const newSale = {
      ...sale,
      state: newState
    }                              // EJEMPLO UTILIZANDO REDUX 
    props.updateEntity(newSale)   // Podriamos Utilizar Redux para hacer el update del estado
                                  // para no reinventar lo que ya esta disponible
                                  //  pero tambien lo hice con una llamada con axios para que vean como lo haría
  } 
*/

  return (
    <div>
      {
        alert.status ? 
          <Alert className='alert-submit' severity={ alert.state === 'error'? errorAlert : successAlert } >{ alert.message }</Alert>
        :
          null
      }
      <h2 id="sales-heading">
         Ventas
        <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity" id="jh-create-entity">
          <FontAwesomeIcon icon="plus" />
          &nbsp;
          Nueva Venta
        </Link>
      </h2>
      <ButtonGroup className='container' size="large" color="primary" aria-label="large button group">
        <MaterialButton id='IN_CHARGE' className='btn-ui'
          onClick={ ()=>{ _handleChangeTypeSales('IN_CHARGE') } }>
            ENCARGADO
        </MaterialButton>
        <MaterialButton id='SHIPPED' className='btn-ui'
          onClick={ ()=>{ _handleChangeTypeSales('SHIPPED') } }>
            ENVIADO
        </MaterialButton>
        <MaterialButton id='DELIVERED' className='btn-ui'
          onClick={ ()=>{ _handleChangeTypeSales('DELIVERED') } }>
            ENTREGADO
        </MaterialButton>
      </ButtonGroup>
      <div className="table-responsive">
        {salesList && salesList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  ID
                </th>
                <th>
                  Estado
                </th>
                <th>
                  Producto
                </th>
                <th className="text-center">
                  Opciones
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {currentSalesList.map((sales, i) => (
                <tr key={`entity-${i}`}>
                  <td>
                    <Button tag={Link} to={`${match.url}/${sales.id}`} color="link" size="sm">
                      {sales.id}
                    </Button>
                  </td>
                  <td>
                    { sales.state === 'IN_CHARGE' ? 'ENCARGADO' : sales.state === 'SHIPPED' ? 'ENVIADO' : 'ENTREGADO' } 
                  </td>
                  <td>{sales.product ? <Link to={`product/${sales.product.id}`}>{sales.product.name}</Link> : ''}</td>
                  <td className="text-center">
                    <div className="btn-group flex-btn-group-container">
                      <Button 
                        onClick={()=>{updateState(sales, 'up')}} 
                        variant='contained' 
                        color={typeSales === 'DELIVERED' ? 'secondary' : 'primary'} 
                        size="sm" 
                        disabled={typeSales==='DELIVERED'} > 
                        <span className="d-none d-md-inline">
                          { typeSales === 'IN_CHARGE' ? 'ENVIAR' : typeSales === 'SHIPPED'? 'ENTREGAR' : 'ENTREGADO' }
                        </span>
                      </Button>
                      {
                        sales.state !== 'IN_CHARGE' ?
                          <Button 
                            onClick={()=>{updateState(sales, 'down')}} 
                            color='warning'
                            size="sm"
                            className='ml-1' >
                            <span className="d-none d-md-inline">
                            Devolver a { typeSales === 'SHIPPED'? '"ENCARGADO"' : '"ENVIADO"' }
                            </span>
                          </Button>
                        :
                          null  
                      }
                      <Button 
                        tag={Link} 
                        to={`${match.url}/${sales.id}/delete`} 
                        color="danger" 
                        size="sm"
                        className=' ml-1'>
                        <FontAwesomeIcon icon="trash" />{' '}
                        <span className="d-none d-md-inline">
                          Eliminar
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && (
            <div className="alert alert-warning">
              <Translate contentKey="merlionTestApp.sales.home.notFound">No Sales found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ sales }: IRootState) => ({
  salesList: sales.entities,
  loading: sales.loading,
});

const mapDispatchToProps = {
  getEntities,
  updateEntity
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(Sales);
